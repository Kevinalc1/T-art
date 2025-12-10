const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB conectado'))
    .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));

const Produto = require('./src/models/Produto');

async function migrateFilesToCloudinary() {
    try {
        console.log('🚀 Iniciando migração de arquivos para Cloudinary...\n');

        // Buscar todos os produtos
        const produtos = await Produto.find({});
        console.log(`📦 Encontrados ${produtos.length} produtos\n`);

        let migrated = 0;
        let skipped = 0;
        let errors = 0;

        for (const produto of produtos) {
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📦 Produto: ${produto.productName || produto._id}`);

            let updated = false;

            // Migrar downloadUrl
            if (produto.downloadUrl && !produto.downloadUrl.startsWith('https://res.cloudinary.com')) {
                console.log(`🔗 Download URL atual: ${produto.downloadUrl}`);

                try {
                    // Fazer upload para Cloudinary
                    const result = await cloudinary.uploader.upload(produto.downloadUrl, {
                        folder: 't-art-products/files',
                        resource_type: 'raw',
                        public_id: `file-${produto._id}`
                    });

                    produto.downloadUrl = result.secure_url;
                    console.log(`✅ Migrado para: ${result.secure_url}`);
                    updated = true;
                    migrated++;
                } catch (err) {
                    console.error(`❌ Erro ao migrar downloadUrl:`, err.message);
                    errors++;
                }
            } else if (produto.downloadUrl) {
                console.log(`⏭️  Download URL já está no Cloudinary`);
                skipped++;
            }

            // Migrar imageUrls
            if (produto.imageUrls && produto.imageUrls.length > 0) {
                const newImageUrls = [];

                for (let i = 0; i < produto.imageUrls.length; i++) {
                    const imageUrl = produto.imageUrls[i];

                    if (!imageUrl.startsWith('https://res.cloudinary.com')) {
                        console.log(`🖼️  Imagem ${i + 1}: ${imageUrl}`);

                        try {
                            const result = await cloudinary.uploader.upload(imageUrl, {
                                folder: 't-art-products/images',
                                public_id: `image-${produto._id}-${i}`
                            });

                            newImageUrls.push(result.secure_url);
                            console.log(`✅ Migrada para: ${result.secure_url}`);
                            updated = true;
                            migrated++;
                        } catch (err) {
                            console.error(`❌ Erro ao migrar imagem ${i + 1}:`, err.message);
                            newImageUrls.push(imageUrl); // Manter URL original em caso de erro
                            errors++;
                        }
                    } else {
                        newImageUrls.push(imageUrl);
                        console.log(`⏭️  Imagem ${i + 1} já está no Cloudinary`);
                        skipped++;
                    }
                }

                if (newImageUrls.length > 0) {
                    produto.imageUrls = newImageUrls;
                }
            }

            // Salvar produto se houve mudanças
            if (updated) {
                await produto.save();
                console.log(`💾 Produto atualizado no banco de dados`);
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Migração concluída!');
        console.log(`📊 Estatísticas:`);
        console.log(`   - Arquivos migrados: ${migrated}`);
        console.log(`   - Arquivos ignorados: ${skipped}`);
        console.log(`   - Erros: ${errors}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro fatal na migração:', error);
        process.exit(1);
    }
}

// Executar migração
migrateFilesToCloudinary();
