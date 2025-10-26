# O que é o Spark?
Spark é um miniframework de renderização feito por alguém com raiva do React. Ele não tem as chatices dele, como setCount, setEffect, etc; e não precisa de um monte de dependências externas. 
Ele ainda está na fase de beta então pode haver erros.

## Porque você está tão irritado com o React?
O React pode ser muito bom para projetos grandes porque foi estruturado para isso, tem um grande ecossistema, etc... Mas caso seja somente você tentando criar um projeto minimalista, vai ter dor de cabeça
com ele pois ele precisa de várias dependências para funcionar. E isso me irrita profundamente pois ele não te dá essas dependências, você tem que caçar elas. Então imagina a pessoa ter que baixar um framework 
que depende de libs que dependem de outras libs... E tudo é você que tem que baixar? Não seria melhor se já estivesse tudo num lugar só? O Spark tem isso. As dependências dele são só o spark.js e utils.js.
Bastando `<script src="spark.js" type="module">` e `<script src="utils.js" type="module">` para poder usar o spark.

## Instalação
1. Copie os arquivos `spark.js` e `utils.js` para seu projeto
2. Adicione no HTML:
```html
<script src="spark.js" type="module"></script>
<script src="utils.js" type="module"></script>
```

## Como usar o Spark?
Antes de mais nada, importe as funções que você vai usar:

```javascript
// O Reative (principal)
import { Reative } from "./spark.js"

// O MemoryManagement
import { MemoryManagement } from "./spark.js"

// O tracebackJS (agradecimentos a Python Software Foundation)
import { tracebackJS } from "./utils.js"

// A classe eventos
import { eventos } from "./utils.js"
```

### Renderização básica
O Spark se baseia numa função chamada render, que serve para renderizar conteúdo HTML, mas com funcionalidades extras. Por exemplo, ele aceita async functions como componentes:

```javascript
import { Reative } from "./spark.js";

const app = new Reative();

async function Component() {
    // lógica
    return `<p> algo </p>`; 
}
app.render(Component, undefined, document.body)
```

#### Parâmetros do render
- **Primeiro argumento**: A função ou expressão que vai retornar algo renderizável (HTML)
- **Segundo argumento**: Nome identificador (obrigatório se o primeiro for string)
- **Terceiro argumento**: Local de renderização (elemento DOM, não seletor)
- **Quarto argumento**: Pool para otimização (opcional)

### Sistema de eventos
No utils.js, você tem a classe "eventos" com `wait` e `callback`. Exemplo:

```javascript
eventos.wait("DOM_LOAD").callback("#btn", () => {
    // lógica
}, "click", {"debug": false});
```

#### Wait
- Argumento único: tipo de espera (ex: "DOM_LOAD" para esperar carregamento do DOM)
- Sintaxe em desenvolvimento, mas "DOM_LOAD" é garantido funcionar

#### Callback
Argumentos:
- **Primeiro**: Seletor do elemento alvo 
- **Segundo**: Função a ser executada
- **Terceiro**: Tipo de evento (default: "click")
- **Quarto**: Configurações extras (ex: {"debug": false})

### Pool de renderização
Para otimizar renders repetidos, use o Pool:

```javascript
const pool = app.Pool();
pool.addRender(Component, ["arg1", "arg2"]);
app.render(Component, undefined, document.body, pool);
```

### Tratamento de erros
O framework usa um formato inspirado no Python:

```javascript
try {
  // código
} catch(error) {
  tracebackJS(error);
}
```

Exemplo de saída:
```
Script TypeError (most recent call last):
    trace: (anonymous) (file http://localhost:5500/app.js, line 5) <================
Reative.render is not a function
```

## Notas importantes
- Projeto em beta - podem existir bugs
- Ao usar strings no render, sempre forneça um nome
- Use elementos DOM (não seletores) no parâmetro local
- Ative debug nos eventos para mais informações
- Caso queira capturar erros no código, use ``tracebackJS(error)``

## Contribuições
- Reporte bugs via issues
- Pull requests são bem-vindos
- Mantenha a simplicidade do projeto

## Licença
[Mit license](./mit.license)

