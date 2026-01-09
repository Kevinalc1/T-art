const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// GET /api/seo/sitemap.xml - Generate dynamic sitemap
router.get('/sitemap.xml', async (req, res) => {
    try {
        const Produto = mongoose.model('Produto');
        const baseUrl = process.env.BASE_URL || 'https://seusite.com';

        // Buscar todos os produtos ativos
        const produtos = await Produto.find({})
            .select('_id productName updatedAt')
            .sort({ updatedAt: -1 });

        // Data atual para páginas estáticas
        const now = new Date().toISOString();

        // Construir XML do sitemap
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Homepage
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>1.0</priority>\n';
        xml += '  </url>\n';

        // Loja
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/loja</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.9</priority>\n';
        xml += '  </url>\n';

        // Coleções
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/colecoes</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';

        // Produtos dinâmicos
        produtos.forEach(produto => {
            const lastmod = produto.updatedAt ? produto.updatedAt.toISOString() : now;

            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/produto/${produto._id}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        // Definir headers corretos
        res.header('Content-Type', 'application/xml');
        res.header('Cache-Control', 'public, max-age=3600'); // Cache de 1 hora
        res.send(xml);

        console.log(`Sitemap gerado com ${produtos.length} produtos`);
    } catch (error) {
        console.error('Erro ao gerar sitemap:', error);
        res.status(500).send('Erro ao gerar sitemap');
    }
});

module.exports = router;
