import { tracebackJS } from "./utils.js"

export class MemoryManagement {
    constructor(backup_url=null) {
        this.backup_url = backup_url
        this.methods = {}

        Object.defineProperties(this.methods, {
            create: {
            value: this.#createNode.bind(this),
            configurable: false,
            enumerable: false,
            writable: false
        },
            repair: {
            value: this.#repair.bind(this),
            configurable: true,
            enumerable: false,
            writable: false
        }
        })
    }

    #repair(local = document.body, advisor = () => {}) {
        const reparation = (substitution) => {
        local.innerHTML = substitution
        }
        if (this.backup_url) {
            fetch(this.backup_url)
                .then(response => response.text())
                .then(reparation)
                .then(advisor)
                .catch(e => {
                    console.trace()
                    console.error(e)
                })
        } else {
            throw TypeError("O repair precisa de um backup para funcionar")
        }
    
  }

    #createNode(html) {
    const template = document.createElement("template")
    template.innerHTML = html.trim()
    return template.content.firstChild?.cloneNode(true) || document.createElement("div")
    }

    verifyNode(name) {
        return document.body.querySelector(name)
    }
}


export class Reative {
    #state = new Map()

    constructor(plugin, babel_activate = false) {
        this.#state.set("subscriber", new Map())
        this.plugin = plugin
        this.babel_activate = babel_activate // separa o booleano da instância Babel
        this.babel = null
        this.mg = new MemoryManagement()
        ;(async () => {
            return await this.#__init__()
        })()
    }


    async #__init__() {
        // O __init__ tenta importar o local onde esta o plugin. Note que o plugin que
        // ele vai instalar é um pré-determinado que você só precisa dar o caminho até ele.
        try {
            if(this.babel_activate === true) {
                this.babel = await import("./babel.js")
            }
        } catch(err) {}
    }

    #state_manager(operation, chave=null, valor=null, local="subscriber" ) {
        if (operation === "set") {
            if(typeof operation !== "string") {
                throw TypeError(`O valor dado a função (${operation}) deve ser uma string, não ${typeof operation}`)
            }

            if(!chave) {
                throw TypeError(`O valor dado a função (${chave}) não pode ser nulo ou indefinido (${typeof chave})`)
            }

            if(!local) {
                throw TypeError(`O valor dado a função (${local}) não pode ser nulo ou indefinido ${typeof local}`)
            }

            this.#state.get(local).set(chave, valor)
        }
        if (operation === "get") {
            if(typeof operation !== "string" || typeof operation === "object") {
                throw TypeError(`O valor dado a função (${operation}) deve ser uma string, não ${typeof operation}`)
            }

            if(!chave) {
                throw TypeError(`O valor dado a função (${chave}) não pode ser nulo ou indefinido (${typeof chave})`)
            }

            return this.#state.get(local).get(chave)
        }
        if (operation === "interation") {
            // this.#state.forEach(local)
        }
        if (operation.hasOwnProperty("activate")) {
            if(typeof operation !== "object") {
                throw TypeError(`O valor dado a função (${operation}) deve ser uma string, não ${typeof operation}`)
            }

            if(!chave) {
                throw TypeError(`O valor dado a função  não pode ser nulo ou indefinido (${chave})`)
            }
            const args = operation["activate"]
            for(let [funcao, valor] of this.#state.get(local)) {
                if (funcao === chave) {
                    let resultado = null
                    if (args.length === valor.length && args.every((v, i) => v === valor[i])) {
                        resultado = funcao(...value)
                    } else {
                        resultado = funcao(...args)
                    }
                    
                    return resultado; 
                } else {
                    throw TypeError("Esta função precisa de uma chave que exista")
                }
            }
        }
    }

    #sanitizeCode(codigo) {
        const variaveis = {};
        const linhas = codigo.split(/[\n;]/);

        for (let linha of linhas) {
            linha = linha.trim();

            // Atribuições: const x = window;
            const atribuicao = linha.match(/(?:const|let|var)\s+(\w+)\s*=\s*(\w+)/);
            if (atribuicao) {
                variaveis[atribuicao[1]] = atribuicao[2];
            }

            // Acesso tipo: x["op" + "en"]
            const chamada = linha.match(/(\w+)\s*\[\s*(["'].*?["'])\s*\]/);
            if (chamada) {
                const nomeVar = chamada[1];
                let metodo;

                try {
                    // tenta reconstruir strings tipo "op" + "en"
                    metodo = eval(chamada[2]);
                } catch {
                    metodo = chamada[2].replace(/['"]/g, "");
                }

                // resolve origem: segue cadeia de atribuições
                let origem = nomeVar;
                while (variaveis[origem]) {
                    origem = variaveis[origem];
                }

                if (
                    (origem === "window" || origem === "document") &&
                    ["open", "cookie", "write", "eval", "location"].includes(metodo)
                ) {
                    return true
                }
            }
        }

    return false;
    }  

    render(expression, name=undefined, local=document.body, subs=true, jsx_use=false) {
        if (typeof expression === "function" && expression.constructor.name === "AsyncFunction") {
            const fn = expression
            let promise = null
            const args = [].concat(name);

            if(!this.#state_manager("get", fn)) {
                this.#state_manager("set", fn, [])
                // aqui pega a promise de fn se ela não existir
                promise = fn()
            } else {
                if(fn.length > args.length) {
                    throw TypeError("Alguns argumentos obrigatórios não foram definidos.")
                }
                try{
                    // aqui pega a promise de fn se ela existir
                    promise = this.#state_manager({"activate":args}, fn)
                } catch(e){
                    tracebackJS(e)
                }
                
            }
            // aqui vai renderizar a promessa.
            promise.then(html => {
                console.log("HTML retornado:", html)
                const match = html.match(/spark-id=['"]([^'"]+)['"]/)
                const id = match ? match[1] : name
                const node = this.mg.verifyNode(`[spark-id=${id}]`)
                const mg = new MemoryManagement()

                if (node) {
                    node.outerHTML = html
                } else {
                    local.appendChild(mg.methods.create(html))
                }

            })

            
        } else if(typeof expression === "string"){
            let fn = null
            if (name === undefined) {
                throw new TypeError("Como você está fornecendo uma expressão, é necessário um nome para a função.");
            }

            let jsx_code = expression;
            
            // Transforma com Babel se for JSX
            if (jsx_use) {
                if (!this.#sanitizeCode(jsx_code)) {
                    throw ReferenceError(`Acesso negado para o script ${jsx_code}`)
                }
                jsx_code = this.babel.transform(expression, {
                    presets: ["solid"]
                }).code;
                if (!this.#sanitizeCode(jsx_code)) {
                    throw ReferenceError(`Acesso negado para o script ${jsx_code}`)
                } else if(this.#state_manager("get", name)) {
                    this.#state_manager("set", name, jsx_code)
                }

                // Cria a função dinamicamente a partir do código
                fn = new Function(`return function ${name}() { return (${jsx_code}); }`)(); // Isso retorna a função
                

            } else {
                let html_scaped = JSON.stringify(expression)
                const match = expression.match(/spark-id=['"]([^'"]+)['"]/)
                const id = match ? match[1] : name
                const node = this.mg.verifyNode(`[spark-id=${id}]`)
                
                
                if (node && subs === true) {
                    node.outerHTML = expression
                } else {
                    fn = new Function("local", "MemoryManagement",`return function ${name}() { 
                    const mg = new MemoryManagement()
                    local.appendChild(mg.methods.create(${html_scaped}))
                    }`)(local, MemoryManagement)

                    fn()

                    // Armazena a função no estado (simulando ponteiro)
                    if(!this.#state_manager("get", fn)) {
                        this.#state_manager("set", fn, [])
                    } else {
                        this.#state_manager({"activate":[]}, fn())
                    }
                }
                
        }
    }

}}

