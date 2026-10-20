# Aplicativo Saúde

## Executar

Use Node.js 22.13 ou superior compatível com o Expo SDK 57.

```sh
npm ci
npm start
```

Para navegador: `npm run web`. Para Android: `npm run android`.

## Onde editar

| O que alterar | Local |
| --- | --- |
| Composição das telas | `src/screens/` |
| Meta, consumo e histórico de água | `src/hooks/useWaterTracker.js` |
| Estado, validação e cálculo de IMC | `src/hooks/useBmiCalculator.js` |
| Cadastro, exclusão e fotos de remédios | `src/hooks/useMedicines.js` |
| Seções visuais de água | `src/components/water/` |
| Seções visuais de IMC | `src/components/bmi/` |
| Campos, botões e componentes de remédios | `src/components/` |
| Cartões da tela inicial | `src/constants/healthItems.js` |
| Cores | `src/constants/theme.js` |
| Meta inicial e quantidades rápidas | `src/constants/water.js` |
| Categorias de IMC | `src/constants/imcCategories.js` |
| Funções auxiliares | `src/utils/` |
| Navegação | `src/navigation/AppNavigator.js` |

As telas conectam os hooks aos componentes. Os hooks guardam o estado e as ações. Os componentes recebem valores e callbacks por props e mantêm seus estilos no próprio arquivo.

Os registros continuam apenas na memória, sem persistência após reiniciar o aplicativo.

Documentação: https://docs.expo.dev/versions/v57.0.0/
