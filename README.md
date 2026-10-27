# Aplicativo Saúde

Aplicativo Expo/React Native com API REST em Node.js/Express e persistência MySQL.

## Arquitetura

1. **Frontend:** Expo/React Native em `src/`; telas chamam a API por `src/services/api.js`.
2. **Backend:** Express em `server/src/`; valida os dados, autentica usuários e acessa o banco.
3. **Dados:** MySQL; o esquema inicial cria a tabela `users` com e-mail único e senha armazenada como hash.

O cadastro e o login usam `POST /api/auth/register` e `POST /api/auth/login`. O token JWT fica no armazenamento local do app (AsyncStorage); senhas em texto puro não são armazenadas. A lista de frutas usa `GET /api/fruits`; a API inclui um catálogo local de 49 frutas em `server/data/fruits.json` como fallback quando Fruityvice está indisponível.

Os dados de acompanhamento de saúde ainda são mantidos localmente pelo app. O banco e a API implementam o cadastro de usuários previsto na arquitetura; sincronizar os históricos de saúde exigiria tabelas e rotas adicionais.

## Preparar o MySQL e a API

Use MySQL (por exemplo, XAMPP) na porta `3307` ou ajuste `DB_PORT`. Execute `server/schema.sql` no MySQL para criar o banco e a tabela. Depois:

```sh
cd server
npm install
```

Copie `server/.env.example` para `server/.env`, defina uma chave `JWT_SECRET` aleatória com pelo menos 32 caracteres e informe as credenciais do MySQL. Inicie a API na raiz do projeto com `npm run api` (ou `npm run api:dev` durante o desenvolvimento). A verificação `GET http://localhost:3000/api/health` informa se o banco está conectado.

## Preparar o app

```sh
npm ci
npm start
```

Para navegador, use `npm run web`. Para acessar a API em dispositivo físico, crie `.env` na raiz com `EXPO_PUBLIC_API_URL=http://IP_DO_COMPUTADOR:3000` (o celular e o computador precisam estar na mesma rede). No emulador Android, use `http://10.0.2.2:3000`; no navegador local, o padrão `http://localhost:3000` funciona.

## Organização do app

| O que alterar | Local |
| --- | --- |
| Composição das telas | `src/screens/` |
| Comunicação com a API | `src/services/api.js` |
| Navegação | `src/navigation/AppNavigator.js` |
| Estado e persistência local | `src/hooks/` e `src/context/` |
| Componentes reutilizáveis | `src/components/` |
| Regras e funções auxiliares | `src/utils/` |
| Rotas e conexão MySQL | `server/src/` |
| Catálogo local de frutas | `server/data/fruits.json` |
| Esquema do banco | `server/schema.sql` |

Documentação do Expo: https://docs.expo.dev/versions/v57.0.0/
