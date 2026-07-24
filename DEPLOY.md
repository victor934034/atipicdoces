# Colocando o site no ar (VPS)

Guia passo a passo para publicar o Atipic Doces em um servidor próprio (VPS).
Escrito pensando em uma VPS Linux (Ubuntu/Debian) nova, mas os passos servem
para qualquer provedor (Hostinger, DigitalOcean, Contabo, etc).

## O que este site precisa

- **Node.js 20 ou mais recente**
- **Disco persistente** — o banco de dados (SQLite) e as fotos enviadas pelo
  painel admin ficam salvos em arquivos no próprio servidor. Por isso uma VPS
  com disco permanente é a escolha certa (diferente de hospedagens
  "serverless" tipo Vercel, onde esses arquivos seriam apagados a cada deploy).

---

## 1. Preparar o servidor (uma vez só)

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar o PM2 (mantém o site rodando e reinicia sozinho se cair)
sudo npm install -g pm2

# Instalar o Nginx (proxy reverso) e o Certbot (certificado SSL grátis)
sudo apt install -y nginx certbot python3-certbot-nginx
```

## 2. Levar o código para o servidor

Envie a pasta do projeto para o servidor (via `git clone` se estiver num
repositório, ou `scp`/SFTP direto da sua máquina). Não é necessário enviar
`node_modules`, `.next` nem `dev.db` — isso é gerado/configurado no servidor.

```bash
cd /var/www
git clone <url-do-seu-repositorio> atipic-doces
cd atipic-doces
```

## 3. Configurar as variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Preencha principalmente:
- `SESSION_SECRET` — gere um valor único e forte com:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
  ```
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — só são usados na primeira vez que o
  banco é criado (veja o passo 5). Depois do primeiro login, a senha se troca
  em `/admin/settings`.

## 4. Instalar dependências e gerar o Prisma Client

```bash
npm install
npx prisma generate
```

## 5. Banco de dados

Você tem duas opções aqui:

### Opção A — Levar o banco que você já usou (recomendado)

Se você já cadastrou produtos, categorias e o número de WhatsApp real durante
o desenvolvimento, é mais simples copiar esse banco pronto direto para o
servidor, em vez de recriar tudo:

```bash
# Da sua máquina, envie o arquivo dev.db e a pasta public/uploads:
scp dev.db usuario@servidor:/var/www/atipic-doces/
scp -r public/uploads usuario@servidor:/var/www/atipic-doces/public/
```

### Opção B — Começar do zero no servidor

```bash
npx prisma migrate deploy
npx prisma db seed
```

Isso cria as tabelas e um cardápio de exemplo (que você edita depois pelo
painel admin) e o usuário admin definido no `.env`.

## 6. Build de produção

```bash
npm run build
```

## 7. Rodar o site com PM2

```bash
pm2 start npm --name "atipic-doces" -- start
pm2 save
pm2 startup   # siga a instrução que aparecer, para o site voltar sozinho se o servidor reiniciar
```

Por padrão o site sobe na porta 3000. Confirme com:

```bash
curl http://localhost:3000
```

## 8. Configurar o Nginx (domínio + HTTPS)

Crie `/etc/nginx/sites-available/atipic-doces`:

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative e gere o certificado SSL grátis:

```bash
sudo ln -s /etc/nginx/sites-available/atipic-doces /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

(Aponte o DNS do domínio para o IP da VPS antes de rodar o certbot.)

---

## Depois de publicar — checklist

- [ ] Testar o cardápio, adicionar itens ao carrinho e clicar em "Finalizar
      pedido" — confirmar que abre o WhatsApp certo
- [ ] Entrar em `/admin/login` e **trocar a senha padrão** em
      "Configurações → Minha conta"
- [ ] Conferir o número de WhatsApp em "Configurações"
- [ ] Testar em celular de verdade (não só no navegador do computador)

## Atualizando o site depois (novo deploy)

```bash
cd /var/www/atipic-doces
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart atipic-doces
```

## Backup

O que importa neste projeto é: **o arquivo `dev.db`** (todo o cardápio,
categorias, configurações e analytics) e **a pasta `public/uploads`** (fotos
dos produtos). Faça backup periódico desses dois — o resto (código) já está
no seu repositório.
