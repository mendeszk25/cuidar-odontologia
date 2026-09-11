# Cuidar Odontologia Integrada

Site institucional da Cuidar Odontologia Integrada, em Gravatá/PE. O projeto foi desenvolvido como site estático, responsivo e sem dependência de framework ou etapa de build.

## Sobre

A interface apresenta os tratamentos da clínica, informações institucionais, equipe, estrutura, diferenciais, dúvidas frequentes, localização e canais de contato. O foco é uma experiência clara, moderna e acessível em desktop e dispositivos móveis.

## Funcionalidades

- Hero institucional responsivo
- Seção de tratamentos
- Apresentação da clínica e da responsável técnica
- Equipe com links oficiais para Instagram
- Galeria de estrutura e tecnologia
- Seção de diferenciais institucionais
- FAQ com elementos nativos `details` e `summary`
- Formulário que prepara a mensagem e abre o WhatsApp
- Links centralizados para WhatsApp, Instagram e Google Maps
- Mapa incorporado com carregamento sob demanda
- Menu mobile com suporte à tecla Escape e gerenciamento de foco
- Animações com suporte a `prefers-reduced-motion`
- Dados estruturados Schema.org para clínica odontológica
- Política de Privacidade

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript puro
- Google Fonts
- Schema.org / JSON-LD

## Estrutura do projeto

```text
cuidar-odontologia/
├── assets/
├── index.html
├── politica-de-privacidade.html
├── style.css
├── hero-reference.css
├── script.js
├── clinic.config.js
├── robots.txt
├── sitemap.xml
└── README.md
```

## Configuração

Os principais dados institucionais estão centralizados em `clinic.config.js`. Atualize esse arquivo quando houver mudança de telefone, WhatsApp, Instagram, endereço, CRO/EPAO, responsável técnica, mapa ou horário de atendimento.

Não adicione senhas, tokens ou credenciais ao arquivo.

## Como executar localmente

O projeto pode ser aberto diretamente pelo `index.html`, mas para testes é recomendado utilizar um servidor local:

```bash
cd cuidar-odontologia
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Personalização dos dados da clínica

Edite `clinic.config.js` para atualizar os dados centralizados. Evite duplicar informações diretamente no HTML quando elas já existirem na configuração.

As informações profissionais, registros, endereço, horário e canais de contato devem ser confirmados pela clínica antes da publicação final.

## Deploy

Por ser estático, o projeto pode ser publicado em serviços como Vercel, Netlify, Firebase Hosting, GitHub Pages ou outro servidor compatível com arquivos HTML/CSS/JS. A configuração atual usa a URL `https://cuidar-odontologia.vercel.app/` nos metadados públicos, no sitemap e no robots.

Se o domínio de produção mudar:

1. atualize `canonical` e `og:url` com a nova URL;
2. atualize as URLs absolutas das imagens sociais;
3. atualize as URLs em `sitemap.xml`;
4. atualize a linha `Sitemap:` em `robots.txt`;
5. confira o compartilhamento Open Graph e Twitter Card após o deploy.

## Responsividade

O layout possui breakpoints para desktop, notebook, tablet e mobile. Antes de publicar, valide pelo menos larguras próximas de 320, 360, 390, 430, 768, 1024, 1366, 1440 e 1920 pixels.

## SEO

O projeto inclui `title`, meta description, Open Graph básico, Twitter Card, favicon, hierarquia semântica e JSON-LD. Campos dependentes do domínio oficial não são preenchidos com URLs fictícias.

## Privacidade

O formulário não envia dados para um backend próprio. Ele monta uma mensagem e abre o WhatsApp para que o usuário conclua o contato. A página `politica-de-privacidade.html` descreve esse fluxo e orienta o visitante.

## Autor

Desenvolvido por [@mendeszk__](https://www.instagram.com/mendeszk__/).

## Backend e infraestrutura

A versão atual do projeto **não utiliza backend próprio**. O site é composto apenas por HTML, CSS e JavaScript estáticos. O formulário de contato valida os dados no navegador, monta a mensagem e abre o WhatsApp; nenhum dado do formulário é persistido pelo projeto.

### Firebase

Firebase não é necessário para as funcionalidades atuais. Caso a clínica escolha Firebase Hosting no futuro, ele deve ser tratado apenas como uma alternativa de hospedagem até existir um requisito real para Firestore, Authentication, Storage ou Cloud Functions.

### Supabase

Supabase não é necessário para as funcionalidades atuais. Não existem tabelas, Auth, Storage, Edge Functions, migrations ou variáveis Supabase neste projeto. Não adicione `service_role` ou qualquer segredo de servidor ao frontend.

### Hospedagem atual e segurança

Os metadados públicos do site usam `https://cuidar-odontologia.vercel.app/` como URL canônica. O arquivo `vercel.json` adiciona headers de segurança compatíveis com o site estático sem introduzir backend ou alterar o layout.

O repositório também possui `.gitignore` para impedir o versionamento acidental de arquivos `.env`, credenciais privadas, chaves e estados locais das CLIs.

Nenhuma variável de ambiente é necessária para executar a versão atual.

Se o domínio de produção mudar, atualize em conjunto:

- `canonical` e `og:url` em `index.html`;
- URLs de imagens Open Graph/Twitter;
- `sitemap.xml`;
- linha `Sitemap:` em `robots.txt`.
