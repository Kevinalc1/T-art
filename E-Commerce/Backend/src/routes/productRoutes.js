const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware.js');
const mongoose = require('mongoose');
const Produto = mongoose.model('Produto');
const Colecao = mongoose.model('Colecao');
const Category = mongoose.model('Category');

// @desc    Buscar todos os produtos
// @route   GET /api/produtos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const produtos = await Produto.find({}).populate('category', 'name');
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error });
  }
});

// @desc    Google Shopping XML Feed (Multi-currency)
// @route   GET /api/produtos/feed/products/:country_code.xml
// @access  Public
router.get('/feed/products/:country_code.xml', async (req, res) => {
  try {
    const { country_code } = req.params;
    const country = country_code.toLowerCase();

    // Validar país suportado
    if (!['br', 'us'].includes(country)) {
      return res.status(400).send('País não suportado. Use "br" ou "us".');
    }

    const products = await Produto.find({
      price: { $exists: true, $ne: null }
    }).populate('category', 'name');

    // MUDANÇA CRÍTICA: Forçando o domínio de produção para o Google Merchant Center
    // O Google exige que os links no XML batam com o domínio reivindicado.
    const frontendUrl = 'https://www.gensartessublimacao.com.br';
    const currency = country === 'br' ? 'BRL' : 'USD';

    // Taxa de conversão fixa para demo/simplicidade (idealmente viria de uma config ou API)
    const USD_RATE = 5.5;

    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>T-art Store (${currency})</title>
<link>${frontendUrl}</link>
<description>Arte Exclusiva e Produtos Digitais</description>
`;

    products.forEach(product => {
      // Tratamento de campos
      const title = product.productName ? product.productName.replace(/[<>&'"]/g, '') : 'Produto sem nome';
      const description = product.description
        ? product.description.replace(/<[^>]*>?/gm, '').replace(/[<>&'"]/g, '') // Remove HTML tags e chars especiais XML
        : 'Sem descrição';
      const imageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '';

      let priceValue, priceString, linkUrl;

      if (country === 'br') {
        priceValue = product.price;
        priceString = `${priceValue.toFixed(2)} BRL`;
        linkUrl = `${frontendUrl}/produto/${product._id}`;
      } else {
        // Conversão para USD
        priceValue = product.price / USD_RATE;
        priceString = `${priceValue.toFixed(2)} USD`;
        linkUrl = `${frontendUrl}/produto/${product._id}?currency=USD`;
      }

      // Validação mínima para o feed
      if (title && imageUrl && product.price) {
        xml += `
<item>
<g:id>${product._id}</g:id>
<g:title>${title}</g:title>
<g:description>${description}</g:description>
<g:link>${linkUrl}</g:link>
<g:image_link>${imageUrl}</g:image_link>
<g:availability>in stock</g:availability>
<g:price>${priceString}</g:price>
${product.category && product.category.name ? `<g:product_type>${product.category.name}</g:product_type>` : ''}
<g:condition>new</g:condition>
<g:identifier_exists>no</g:identifier_exists>
<g:size>U</g:size>
</item>
`;
      }
    });

    xml += `
</channel>
</rss>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);

  } catch (error) {
    console.error('Erro ao gerar XML Feed:', error);
    res.status(500).send('Erro ao gerar feed XML');
  }
});


// @desc    Buscar um produto por ID
// @route   GET /api/produtos/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Produto não encontrado (ID inválido)' });
    }

    const produto = await Produto.findById(req.params.id)
      .populate('category', 'name')
      .populate('comboProducts');
    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(produto);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar o produto', error });
  }
});

// @desc    Criar um novo produto
// @route   POST /api/produtos
// @access  Private
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      productName,
      description,
      price,
      imageUrls,
      downloadUrl,
      downloadUrls,
      isCombo,
      comboProducts,
      category,
    } = req.body;

    if (!category || category === '' || category === 'null') {
      return res.status(400).json({
        message: 'Por favor, selecione uma categoria para o produto. Crie uma categoria primeiro se necessário.'
      });
    }

    if (isCombo === false && (!downloadUrl && (!downloadUrls || downloadUrls.length === 0))) {
      return res.status(400).json({
        message: 'O campo "Ficheiro da Arte (Download)" é obrigatório para produtos que não são combos.'
      });
    }

    const novoProduto = new Produto({
      productName,
      description,
      price,
      imageUrls,
      downloadUrl,
      downloadUrls,
      isCombo,
      comboProducts,
      category,
    });
    await novoProduto.save();

    // Auto-atribuir à coleção baseada na categoria
    try {
      if (category) {
        const categoryDoc = await Category.findById(category);
        if (categoryDoc) {
          const colecao = await Colecao.findOne({ name: categoryDoc.name });
          if (colecao) {
            if (!colecao.products.includes(novoProduto._id)) {
              colecao.products.push(novoProduto._id);
              await colecao.save();
              console.log(`Produto ${novoProduto._id} adicionado à coleção ${colecao.name}`);
            }
          }
        }
      }
    } catch (colecaoError) {
      console.error('Erro ao auto-atribuir produto à coleção:', colecaoError);
      // Não falhar a request principal se isso falhar
    }

    res.status(201).json(novoProduto);
  } catch (error) {
    console.error('Erro ao criar produto:', error);

    if (error.name === 'ValidationError' && error.errors?.category) {
      return res.status(400).json({
        message: 'Por favor, selecione uma categoria válida para o produto.'
      });
    }

    res.status(400).json({
      message: error.message || 'Erro ao criar produto'
    });
  }
});

// @desc    Atualizar um produto
// @route   PUT /api/produtos/:id
// @access  Private
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isCombo, downloadUrl, downloadUrls, category } = req.body;

    if (category !== undefined && (!category || category === '' || category === 'null')) {
      return res.status(400).json({
        message: 'Por favor, selecione uma categoria para o produto.'
      });
    }

    if (isCombo === false && (!downloadUrl && (!downloadUrls || downloadUrls.length === 0))) {
      return res.status(400).json({
        message: 'O campo "Ficheiro da Arte (Download)" é obrigatório para produtos que não são combos.'
      });
    }

    const produtoAtualizado = await Produto.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!produtoAtualizado) {
      return res.status(404).json({ message: 'Produto não encontrado para atualizar' });
    }

    // Auto-atribuir à coleção baseada na nova categoria (se mudou)
    try {
      if (req.body.category) {
        const categoryDoc = await Category.findById(req.body.category);
        if (categoryDoc) {
          const colecao = await Colecao.findOne({ name: categoryDoc.name });
          if (colecao) {
            // Verificar se já está na coleção
            if (!colecao.products.includes(produtoAtualizado._id)) {
              colecao.products.push(produtoAtualizado._id);
              await colecao.save();
              console.log(`Produto ${produtoAtualizado._id} adicionado à coleção ${colecao.name} após update`);
            }
          }
        }
      }
    } catch (colecaoError) {
      console.error('Erro ao auto-atribuir produto à coleção (update):', colecaoError);
    }

    res.json(produtoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);

    if (error.name === 'ValidationError' && error.errors?.category) {
      return res.status(400).json({
        message: 'Por favor, selecione uma categoria válida para o produto.'
      });
    }

    res.status(400).json({
      message: error.message || 'Erro ao atualizar produto'
    });
  }
});

// @desc    Apagar um produto
// @route   DELETE /api/produtos/:id
// @access  Private
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const produtoApagado = await Produto.findByIdAndDelete(id);
    if (!produtoApagado) {
      return res.status(404).json({ message: 'Produto não encontrado para apagar' });
    }
    res.json({ message: 'Produto apagado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar produto', error });
  }
});

module.exports = router;