const url = require('url');

/**
 * Middleware para Proteção de Hotlink
 * Impede que outros sites incorporem suas imagens/arquivos diretamente.
 * Permite acesso direto (sem referer) e domínios na lista de permissões.
 */
const hotlinkProtection = (req, res, next) => {
    const referer = req.headers.referer;

    // 1. Permitir acesso direto (sem referer)
    // Isso é importante para downloads diretos, leitores de email, etc.
    if (!referer) {
        return next();
    }

    try {
        const refererUrl = new URL(referer);
        const refererHostname = refererUrl.hostname;

        // --- CONFIGURAÇÃO: SEUS DOMÍNIOS ---
        // Adicione aqui os domínios do seu próprio site
        const myDomains = [
            'localhost',
            '127.0.0.1',
            // Adicione seu domínio de produção aqui quando tiver um
            // 'meusite.com.br',
            // 'www.meusite.com.br'
        ];

        // Verifica se o referer é do próprio site
        if (myDomains.includes(refererHostname)) {
            return next();
        }

        // --- CONFIGURAÇÃO: LISTA DE PERMISSÕES (WHITELIST) ---
        // Adicione aqui domínios externos que podem usar suas imagens
        const allowedDomains = [
            // Redes Sociais
            'facebook.com',
            'www.facebook.com',
            'instagram.com',
            'www.instagram.com',
            'twitter.com',
            'www.twitter.com',
            'x.com',
            'www.x.com',
            'pinterest.com',
            'www.pinterest.com',
            'linkedin.com',
            'www.linkedin.com',

            // Google (Imagens, Gmail, etc)
            'google.com',
            'www.google.com',
            'mail.google.com',

            // Leitores de RSS e Agregadores
            'feedly.com',
            'www.feedly.com',
            'flipboard.com',

            // Outros
            // 'parceiro.com.br',
        ];

        // Verifica se o hostname termina com algum dos domínios permitidos
        // (para permitir subdomínios como cdn.facebook.com, etc.)
        const isAllowed = allowedDomains.some(domain =>
            refererHostname === domain || refererHostname.endsWith('.' + domain)
        );

        if (isAllowed) {
            return next();
        }

        // Se chegou aqui, o acesso é negado
        console.warn(`[Hotlink Protection] Bloqueado acesso de: ${referer}`);
        return res.status(403).send('Hotlink Forbidden');

    } catch (error) {
        // Em caso de erro ao processar o referer, permite o acesso por segurança
        console.error('[Hotlink Protection] Erro ao verificar referer:', error);
        return next();
    }
};

module.exports = hotlinkProtection;
