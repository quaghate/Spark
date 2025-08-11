# O que é o Spark?
  Spark é um miniframework de renderização feito por alguém com raiva do React. Ele não tem as chatices dele, como setCount, setEffect, etc; e não precisa de um monte de dependencias externas.
  Ele ainda está na fase de beta então pode haver erros.

  ## Porque você esta tão irritado com o React?
  O React pode ser muito bom para projetos grandes porque foi estruturado para isso, tem um grande ecossistema, etc... Mas caso seja somente você tentando criar um projeto minimalista, vai ter dor de cabeça
  com ele pois ele precisa de várias dependencias para funcionar. E isso me irrita profundamente pois ele não te dá essas dependencias, você tem que caçar elas. Então imagina a pessoa ter que baixar um framework 
  que depende de libs que dependem de outras libs... E tudo é você que tem que baixar? Não seria melhor se já estivesse tudo num lugar só? O Spark tem isso. as dependencias dele são basicamente dos arquivos deles,
  então basta ``<script src="spark.js" type="module">`` e ``<script src="utils.js" type="module">`` que já dá para usar o Spark

## Como usar o Spark?
Antes de mais nada, copie o arquivo, faça os dois ``<scripts src="...">`` e importe as funções que você vai usar.

---
O Spark se baseia numa função chamada render, que serve para renderizar conteúdo HTML, mas com funcionalidades extras. Por exemplo, ele aceita async functions como componentes:
```JavaScript
import { Reative } from "./spark.js";
async function Component() {
    // lógica
    return `<p> algo </p>`; 
}
Reative.render(Component, undefined, document.body, true)
```

Explicação:
- Primeiro argumento: A função (ou expressão) que vai retornar algo renderizavel pelo render (diga-se: um valor HTML)
- Segundo argumento: Se o primeiro argumento for uma string ao invés de uma função assíncrona, ele vai pedir um nome para ser indentificado. Esse argumento só é obrigatório se aquele argumento for uma String
- Terceiro argumento: O local onde o HTML vai ser renderizado. Normalmente ele é renderizado no corpo (OBS: é necessário dar o elemento, então não adianta só dar ``"#id"``, tem que usar ``document...`` para pegar o elemento)
- Quarto argumento: Se caso já tiver sido renderizado, se é para substituir ou não. Quando ele não substitui ele cria um novo com o mesmo Id.

Além disso, no utils.js, você vai ter a classe "eventos", que tem duas outras funções que vão te ajudar na codificação, o ``wait`` e o ``callback``. Vamos dar um exemplo com os dois:
  
  ```JavaScript
eventos.wait("DOM_LOAD").callback("#btn", () => {
    // lógica
}, "click", {"debug": false});
  ```
Explicação do ``wait``: O unico argumento que ele usa é o tipo de espera que ele vai fazer, é uma sintaxe especifica que eu estou aprimorando mas tenho certeza que o "DOM_LOAD" funciona. Ele espera o DOM carregar. Algo bem simples,
mas que facilita a compreensão do código.

Explicação dos argumentos do Callback:
- Primeiro argumento: Aonde vai ser escutado para o callback ser ativado.
- Segundo argumento: A função a ser ativada.
- Terceiro argumento: Qual é o evento que vai ativar a função do segundo argumento. O padrão é "click".
- Quarto argumento: Modos adicionais do addEventListener e o "debug", que se ativado ajuda a capturar erros, mas não é garantido a precisão pois eu uso debugger e ele não é muito confiavel.

#### Nota:
O nome da classe é mesmo Reative, não é erro não.

---
Eu uso um sistema diferente de erros que o padrão do JS, que é o tracebackJS, dá para chamar ele também, o unico argumento dele é o erro. Ele foi inspirado no traceback do python então créditos a
Python Software Foundation. As mensagens de erro deste framework podem aparecer parecidas com esta:
```Error
Script TypeError (most recent call last):
    trace: (anonymous) (file http://127.0.0.1:5500/testes.js, line 5) <================
Reative.render is not a function
```
E só para não confundir: Eu usei errado o Reative.render de propósito. Como é uma classe tem que primeiro instanciar ela mas eu não fiz isso (tratei como uma função), e daí o erro.

