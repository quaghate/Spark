
export class ValueError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValueError";
  }
}

export function tracebackJS(error, stack = []) {
    try {
        const traceLines = [];
        let output = `Script ${error.name || error.reason || "Error"} (most recent call last):\n`;

        const rawStack = error.stack?.split("\n") || [];
        for (const line of rawStack) {
            if (line.includes("at ")) {
                const match = line.match(/at (.*?) \((.*?):(\d+):\d+\)/) || line.match(/at (.*?):(\d+):\d+/);
                if (match) {
                    let fn, file, lineNumber;

                    if (match.length === 4) {
                        [, fn, file, lineNumber] = match;
                    } else {
                        fn = "(anonymous)";
                        [, file, lineNumber] = match;
                    }

                    traceLines.push([fn, file, lineNumber]);
                }
            }
        }

        // Substituir stack se fornecida
        if (stack.length > 0) traceLines.splice(0, traceLines.length, ...stack);

        traceLines.forEach((t, i) => {
            const prefix = i === 0 ? "    trace: " : "    -> ";
            const line = `${prefix}${t[0]} (file ${t[1]}, line ${t[2]})`;
            output += line + (i === traceLines.length - 1 ? " <================\n" : "\n");
        });

        if (error.message) output += error.message + "\n";

        console.error(output);

    } catch (internalErr) {
        console.error("Erro interno no tracebackJS:");
        console.error(internalErr);
    }
}


export function isDict(obj) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

export class eventos {
    static callback(Id, funcoes, evento="click", config={"debug": true}) {
        const object = document.querySelector(Id);
        let avancado = { ...config };
        delete avancado["debug"];
        
        if (document.readyState == "loading") {
            console.error("DOM ainda não foi carregado. Verifique a ordem de carregamento do script no HTML")
            if (config["debug"] == true) {
                debugger
                return;
            } 
        } else if (!object) {
            console.error("Seletor não encontrado")
            if (config["debug"] == true) {
                debugger
                return;
            } 
        } else {
            if (!Array.isArray(funcoes)){ 
            object.addEventListener(evento, funcoes, avancado);
            } else {
                for (const funcao of funcoes) {
                    if (typeof funcao !== "function") {
                        console.error("Callback invalid", funcao)
                        if (config["debug"]) {
                            debugger
                        } else {
                            continue
                        }
                    } else {
                        object.addEventListener(evento, funcao, avancado)
                    };
                    
                };
                
            };
            };
        return this 
        };

    static wait(condition) {
        const handler = new Proxy(this,{
            get(target, prop) {
                if (typeof target[prop] === "function")
                    return function(...args) {
                    // Aqui que esta a lógica do código. 
                    // O resto da função é tudo juridiques dos códigos.
                    if (condition === "DOM_LOAD") {
                        document.addEventListener("DOMContentLoaded", () => {
                            target[prop].apply(this, args)
                        });

                    } else if (isDict(condition) && condition.hasOwnProperty("VALUE_IN")) {
                        const comparador = condition["VALUE_IN"][0];
                        let valores = condition["VALUE_IN"].slice(1);
                        let log = [];

                        for (const valor of valores)
                            if (comparador === valor) {
                                log.push(valor);
                            };

                        if (log.length !== 0) {
                            console.trace(log);
                            setTimeout(() => {
                                target[prop].apply(this, args)}, 60000);
                        };

                    } else if (isDict(condition) && condition.hasOwnProperty("WAIT_FUNCTION")) {
                        let retorno = []

                        if (Array.isArray(condition["WAIT_FUNCTION"])) {
                            
                            for (const iten of condition["WAIT_FUNCTION"]) {
                                if (isAsync(iten)) {
                                    retorno.push(async () => { const declaravel = await iten(); return declaravel;})
                                } else {
                                    retorno.push(iten())
                                }
                            }
                        } else if (isAsync(condition["WAIT_FUNCTION"])) {
                                    retorno.push(async () => { const declaravel = await condition["WAIT_FUNCTION"](); return declaravel;});
                        } else {
                            retorno.push(condition["WAIT_FUNCTION"]())
                        }
                    }
                    }
            }
        })

        return handler

    }
    
};

export class UIcontroler {

    constructor(debug=True) {
        this.c_style = CSSStyleSheet()
        this.state = {
            "hidden": `
            .hidden {
                display: none;
            }
            `
        }
        this.debug = debug
    }

    addStyle(name, style=null, fallback_function = undefined) {
        if (name in this.state) {
            try {
                this.c_style.replaceSync(this.state["hidden"])
            } catch(e) {
                tracebackJS(e)
            }
        } else if (!style) {
            throw ValueError(`A função espera um valor em style (não ${style})
                 para criar estilos personalizados.`)
        } else if (typeof style !== "string") {
            throw TypeError(`A função espera receber uma string, não ${typeof style}`)
        } else {
            style = this.smartCSSFixer(style)
            let classe = "." + name.trim()
            const dict_string = `${classe} { ${style} }`;
            try {
                this.c_style.replaceSync(dict_string)
            } catch (e) {
                if (fallback_function) {
                    fallback_function()
                } else {
                    tracebackJS(e)
                }
            }
        }
        
    }

    smartCSSFixer(css) {
    if (typeof css !== "string") {
        throw TypeError(`A função recebeu um ${typeof css}, mas ela espera uma string como argumento`);
    }

    const knownProps = [
        "color", "margin", "padding", "font-size", "background",
        "width", "height", "top", "left", "right", "bottom"
    ];

    try {
        const corrected = css
            .split("\n")
            .map(line => {
                let trimmed = line.trim();

                if (!trimmed || trimmed.endsWith("{") || trimmed.endsWith("}")) return trimmed;

                if (!trimmed.includes(":")) {
                    if (this.debug === true) {
                        console.warn("Você esqueceu de ':' na linha ->", trimmed);
                        debugger;
                    }
                    const match = trimmed.match(/^([a-z-]+)\s+(.+)$/);
                    if (match && knownProps.includes(match[1])) {
                        trimmed = `${match[1]}: ${match[2]}`;
                    }
                }

                if (!trimmed.endsWith(";")) {
                    if (this.debug === true) {
                        console.warn("Você esqueceu de ';' na linha ->", trimmed);
                        debugger;
                    }
                    trimmed += ";";
                }

                return trimmed;
            })
            .join("\n");

        return corrected;

    } catch (e) {
        tracebackJS(e);
        return css;
    }
}

}
