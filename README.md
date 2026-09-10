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

Por ser estático, o projeto pode ser publicado em serviços como Vercel, Netlify, Firebase Hosting, GitHub Pages ou outro servidor compatível com arquivos HTML/CSS/JS.

Quando o domínio oficial estiver definido:

1. adicione `canonical` e `og:url` com a URL real;
2. use URLs absolutas para as imagens sociais;
3. preencha `sitemap.xml` apenas com URLs públicas reais;
4. adicione a linha `Sitemap: https://dominio-real/sitemap.xml` ao `robots.txt`;
5. confira o compartilhamento Open Graph e Twitter Card após o deploy.

## Responsividade

O layout possui breakpoints para desktop, notebook, tablet e mobile. Antes de publicar, valide pelo menos larguras próximas de 320, 360, 390, 430, 768, 1024, 1366, 1440 e 1920 pixels.

## SEO

O projeto inclui `title`, meta description, Open Graph básico, Twitter Card, favicon, hierarquia semântica e JSON-LD. Campos dependentes do domínio oficial não são preenchidos com URLs fictícias.

## Privacidade

O formulário não envia dados para um backend próprio. Ele monta uma mensagem e abre o WhatsApp para que o usuário conclua o contato. A página `politica-de-privacidade.html` descreve esse fluxo e orienta o visitante.

## Autor

Desenvolvido por [@mendeszk__](https://www.instagram.com/mendeszk__/).
