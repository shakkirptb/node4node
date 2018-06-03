/**
 * @author shakkirptb@gmail.com
 * */
const ootil = require("ootil");

const konst = {
    TYPE: "type"
}

var Node = function(node) {
    for (attrib in node) {
        this[attrib] = node[attrib];
    }
    this.id = node.id;
    this.has = node.has instanceof Array ? [].concat(node.has) : [];
    this.isA = node.isA || konst.TYPE;
    this.isPartOf = node.isPartOf instanceof Array ? [].concat(node.isPartOf) : [];
    //	this.container = container;
}
Node.konst = konst;
Object.defineProperty(Node.prototype, "addTo", {
    value: function(obj, type) {
        if (obj && type && obj instanceof Object && type instanceof Node) {
            let typeId = type.id;
            //add without duplicate
            if (obj[typeId] instanceof Array) {
                if (obj[typeId].indexOf(this) == -1) {
                    obj[typeId].push(this);
                }
            } else {
                obj[typeId] = [this]
            }
        }
    }
});
Object.defineProperty(Node.prototype, "addAsRelative", {
    value: function(obj, parent) {
        if (obj instanceof Object && parent instanceof Node) {
            this.addTo(obj, parent);
            if (parent.has.indexOf(this) == -1) {
                parent.has.push(this);
            }
            let grands = parent.getParents();
            if (grands) {
                for (grand of grands) {
                    this.addAsRelative(obj, grand);
                }
            }
        }
    }
});
//intersection of two sets
Object.defineProperty(Node.prototype, "getParents", {
    value: function() {
        var parents = [].concat(this.isPartOf);
        parents.push(this.isA);
        parents.push(this.isATypeOf);
        return parents;
    }
});
Object.defineProperty(Node.prototype, "getChildren", {
    value: function() {
        return this.has;
    }
});
Object.defineProperty(Node.prototype, "getAllParents", {
    value: function() {
        var res = this.getParents();
        for (p of res) {
            if (p instanceof Node) {
                res = res.concat(p.getAllParents());
            }
        }
        return res;
    }
});
Object.defineProperty(Node.prototype, "get", {
    value: function(query) {
        if (query instanceof Object) {
            return this.has.query(query);
        }
        return this[query];
    }
});
Object.defineProperty(Node.prototype, "getAllChildren", {
    value: function() {
        var res = this.getChildren();
        for (c of res) {
            if (c instanceof Node) {
                res = res.concat(c.getAllChildren());
            }
        }
        return res;
    }
});
Object.defineProperty(Node.prototype, "commonGParents", {
    value: function(filters) {
        return this.commonNodes(filters, "getAllParents");
    }
});
Object.defineProperty(Node.prototype, "commonGChildren", {
    value: function(filters) {
        return this.commonNodes(filters, "getAllChildren");
    }
});
Object.defineProperty(Node.prototype, "commonChildren", {
    value: function(filters) {
        return this.commonNodes(filters, "has");
    }
});
Object.defineProperty(Node.prototype, "commonParents", {
    value: function(filters) {
        return this.commonNodes(filters, "isPartOf");
    }
});
Object.defineProperty(Node.prototype, "commonRelatives", {
    value: function(filters) {
        return this.commonNodes(filters, "getAll");
    }
});
Object.defineProperty(Node.prototype, "getRelative", {
    value: function(rel) {
        if (typeof this[rel] === "function") {
            return this[rel]();
        } else {
            return this[rel];
        }
    }
});
Object.defineProperty(Node.prototype, "commonNodes", {
    value: Node.prototype.commonNodes = function(filters, rel) {
        var res = this.getRelative(rel);
        if (filters != null) {
            if (filters instanceof Node) {
                if (this == filters) {
                    return res;
                }
                return res.intersection(filters.getRelative(rel));
            }
            if (filters instanceof Array) {
                //TODO: optimize this by comparing all at once
                for (fil of filters) {
                    if (fil instanceof Node) {
                        res = res.intersection(fil.getRelative(rel));
                    }
                }
                return res;
            }
        }
        return res || [];
    }
});
//union of two sets
Object.defineProperty(Node.prototype, "union", {
    value: function(type) {
        if (type) {
            return Node.groups[this.id].concat(Node.groups[type.id])
        }
        return this.has || [];
    }
});
Object.defineProperty(Node.prototype, "getType", {
    value: function(type) {
        return this.getAll().getType(type);
    }
});
Object.defineProperty(Node.prototype, "getAll", {
    value: function(type) {
        //	if(this.isA == konst.TYPE){
        //		return this.has;
        //	}
        var related = this.has.concat(this.isPartOf).unique();
        if (type != null) {
            return related.filter(function(item) {
                return item.isAKindOf(type);
            });
        }
        return related;
    }
});
Object.defineProperty(Node.prototype, "alsoHas", {
    value: function(has) {
        if (has instanceof Array) {
            this.has.concat(has);
            return;
        }
        this.has.push(has);
    }
});
Object.defineProperty(Node.prototype, "isAKindOf", {
    value: function(type) {
        return this.isA == type || this.isA.isATypeOf == type
    }
});
Object.defineProperty(Node.prototype, "toString", {
    value: function() {
        return this.id;
    }
});
//
Object.defineProperty(Node.prototype, "isAlsoPartOf", {
    value: function(isPartOf, obj) {
        this.isPartOf.push(isPartOf);
        this.addAsRelative(obj.groups, isPartOf);
        isPartOf.has.push(this);
    }
});
//map string property to node objects
const ignoreAttr = ["_id", "id", "isA", "isATypeOf", "has", "isPartOf", "_noMatches"];
Node.getShallow = function($this, deeper) {
    if ($this == null) {
        return null;
    }
    var op = {};
    if ($this instanceof Node) {
        op.id = $this.id || "unknown",
            op.type = $this.isA.id || "type"
    }
    for (attr in $this) {
        let prop = $this[attr];
        if (ignoreAttr.indexOf(attr) == -1 && typeof prop !== "function") {
            if (prop instanceof Array) {
                op[attr] = [];
                for (p of prop) {
                    if (p instanceof Node) {
                        op[attr].push(p.id);
                    } else {
                        op[attr].push(p);
                    }
                }
            } else if (prop instanceof Node) {
                op[attr] = prop.id;
            } else {
                op[attr] = prop;
            }
        }
    }
    if (deeper) {
        op.has = $this.has.getShallow();
        op.isPartOf = $this.isPartOf.getShallow();
    }
    return op;
}
Object.defineProperty(Node.prototype, "getShallow", {
    value: function(deeper) {
        return Node.getShallow(this, deeper);
    }
});

//export
module.exports = Node;