import { tracebackJS } from "./utils.js"

export class MemoryManagement {
    constructor(backup_url=null) {
        this.backup_url = backup_url
        this.methods = {}

        Object.defineProperties(this, {
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
    #cache = new Map()

    constructor() {
        this.mg = new MemoryManagement()
    }

    // lida com a execução de componentes assíncronos
    #intern_asyncRender(expression, name, local) {
        const fn = expression
        let promise = null
        const args = [].concat(name);
        try{
            promise = fn(...args)
        } catch(e) {
            tracebackJS(e)
        }

        // aqui vai renderizar a promessa.
        promise.then(html => {
            const mg = new MemoryManagement()

            local.appendChild(mg.methods.create(html))
        })
    }

    #intern_componentRender(fn, args, local) {
        const mg = new MemoryManagement()
        try{
            const html = fn(...args)
        } catch(e){
            tracebackJS(e)
        }
        
        if (html === this.#cache.get(fn.name)) {
            return;
        } else {
            local.appendChild(mg.create(html))
            this.#cache.set(fn.name, html)
        }

    }

    #intern_stringAvaliator(name, html, local) {
        return new Function("local", "MemoryManagement",`return function ${name}() { 
                const mg = new MemoryManagement()
                local.appendChild(mg.create(${html}))
                }`)(local, MemoryManagement)
    }

    #intern_stringRender(expression, name, local) {
        let fn = undefined
        let html_scaped = JSON.stringify(expression) 
            
        if (this.#cache.get(name) === expression) {
            return;
        } else {
            fn = this.#intern_stringAvaliator(name, html_scaped, local)
            try{
                fn()
            } catch(e){
                tracebackJS(e)
            }
            

            this.#cache.set(fn.name, expression)
        }        
        
    }

    render(expression, name=undefined, local=document.body, pool=undefined) {
        if (typeof expression === "function" && expression.constructor.name === "AsyncFunction") {
            let fn = pool?.getRender(expression)
            let args = undefined

            if (typeof name === "string"){
                args = [name]
            } else {
                args = [...name]
            }
            if (fn) {
                let promise = fn(...args)

                // aqui vai renderizar a promessa.
                promise.then(html => {
                    const mg = new MemoryManagement()

                    local.appendChild(mg.methods.create(html))
                })
            } else {
                this.#intern_asyncRender(expression, args, local)
            }
        } else if(typeof expression === "function"){
            let fn = pool?.getRender(expression)
            let args = undefined

            if (typeof name === "string"){
                args = [name]
            }else {
                args = [...name]
            }
            if (fn) {
                fn(...args)
            } else {
                this.#intern_componentRender(expression, args, local)
            }
        } else if(typeof expression === "string"){
            let fn = pool?.getRender(name)

            if (name === undefined) {
                throw new TypeError("Como você está fornecendo uma expressão, é necessário um nome para ela.");
            }
            
            if (fn && typeof fn === "function") {
                fn()
            } else {
                this.#intern_stringRender(expression, name, local)

            }
            
        }
    }

    replace(expression, name, mode="inner", pool=undefined) {
        const local = document.querySelector(`#${name}`)

        // helper para não repetir código
        const replacement = (expression, name, local, pool) => {
            if (typeof expression === "string") {
                this.render(expression, name, local, pool)
            } else {
                this.render(expression, undefined, local, pool)
            }
        }

        // Modos de substituição
        if (mode === "inner") {
            local.innerHTML = ""
            replacement(expression, name, local, pool)
        } else if (mode === "outer") {
            local.outerHTML = `<div id="${name}"></div>`
            if (typeof expression === "string") {
                this.render(expression, name, local, pool)
            } else {
                this.render(expression, undefined, local, pool)
            }
        }
    }

    Pool() {
        const pool = {}
        Object.defineProperties(pool, {
            "renderes": {
                "value": new Map(),
                "writable": true,
                "enumerable": true
            },
            "addRender": {
                "value": (fn, args) => {
                    pool.renderes.set(fn, [...args])
                    return this
                },
                "writable": false,
                "enumerable": false,
                "configurable": false
            },
            "getArgs_render": {
                "value": (fn) => {
                    return pool.renderes.get(fn)
                },
                "writable": false,
                "enumerable": false,
                "configurable": false
            },
            "getRender": {
                "value": (fn) => {
                     for (let key of pool.renderes.entries()) {
                        if (key.name === fn.name) return key
                    }
                    return undefined
                },
                "writable": false,
                "enumerable": false,
                "configurable": false
            }
        })
        return pool
    }
}

