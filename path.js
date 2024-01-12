class PathProcessor {
    path;
    hasTrailingSlash = false;
    node = (typeof module !== 'undefined' && module.exports) ? true : false;

    constructor(path) {
        this.path = path;
    }

    #removeTrailingSlash(path) {
        if(path === "/") {
            return path;
        }
        return path.endsWith("/") ? path.slice(0, -1) : path
    }

    full() {
        if(!this.node) return;
        let path = this.path;
        this.path = ""
        this.join(Path.homedir(), path)
        return this;
    }

    web() {
        if(!this.node) return;
        const os = require('os')
        this.path = this.path.replace(this.#removeTrailingSlash(os.homedir()), "")
        if(this.path === "") {
            this.path = "/"
        }
        return this;
    }

    encode() { // Uses the built in encodeURI and also encodes certain characters that are't covered by it
        this.path = encodeURI(this.path).replace(/[!'()*]/g, function(c) {
            return '%' + c.charCodeAt(0).toString(16);
        });
        return this;
    }

    decoded() {
        this.path = decodeURIComponent(this.path);
        return this;
    }

    parent() {
        const parts = this.path.split('/').filter(Boolean);
        parts.pop();
        this.path = '/' + parts.join('/');
        return this;
    }

    end() {
        const parts = this.path.split('/').filter(Boolean);
        this.path = parts.pop() || '';
        return this;
    }
    
    trailingSlash() {
        this.path = this.path.endsWith("/") ? this.path : this.path+"/";
        this.hasTrailingSlash = true;
        return this;
    }
    
    noTrailingSlash() {
        this.path = this.#removeTrailingSlash(this.path)
        return this;
    }

    join(...segments) {
        if (this.path) {
            segments.unshift(this.path);
        }

        this.path = segments
            .map((part, index) => {
                if (index === 0) {
                    return part.trim().replace(/[/]*$/g, '');
                } else {
                    return part.trim().replace(/(^[/]*|[/]*$)/g, '');
                }
            })
            .filter(Boolean) // Remove empty segments
            .join('/');

        return this;
    }

    components() {
        return this.path.split('/').filter(Boolean);
    }

    build() {
        return this.hasTrailingSlash ? this.path : this.#removeTrailingSlash(this.path)
    }
}

export default class Path {
    static full(path) {
        return new PathProcessor(path).full();
    }

    static web(path) {
        return new PathProcessor(path).web();
    }

    static decoded(path) {
        return new PathProcessor(path).decoded()
    }

    static encode(path) {
        return new PathProcessor(path).encode()
    }

    static parent(path) {
        return new PathProcessor(path).parent();
    }

    static end(path) {
        return new PathProcessor(path).end();
    }
    
    static trailingSlash(path) {
        return new PathProcessor(path).trailingSlash();
    }
    
    static noTrailingSlash(path) {
        return new PathProcessor(path).noTrailingSlash();
    }

    static components(path) {
        return new PathProcessor(path).components();
    }

    static join(...segments) {
        return new PathProcessor(null).join(...segments);
    }

    static homedir() {
        if(typeof module === 'undefined' || !module.exports) return;
        const os = require('os')
        let ret = os.homedir().replace(/\\/g, '/').replace(/^[a-zA-Z]:/, '');
        return ret
    }
}

window.Path = Path;