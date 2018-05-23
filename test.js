
var Node = require("./index.js");

//defining a school using node4node nodes

//root node
var type=new Node({id:"type"});

//primary type nodes
var person=new Node({id:"person",isA:type});
var school=new Node({id:"school",isA:type});
var course=new Node({id:"course",isA:type});

//secondary type nodes
var physics=new Node({id:"physics",isATypeOf:course});
var chemistry=new Node({id:"chemistry",isATypeOf:course});
var teacher=new Node({id:"teacher",isATypeOf:person});
var student=new Node({id:"student",isATypeOf:person});

//value nodes
var susi = new Node({id:"susi",isA:teacher,isPartOf:[physics]});
var thomas = new Node({id:"thomas",isA:teacher,isPartOf:[chemistry]});

var shakkir = new Node({id:"shakkir",isA:student,isPartOf:[physics]});
var sameer = new Node({id:"sameer",isA:student,isPartOf:[physics]});
var appu = new Node({id:"appu",isA:student,isPartOf:[chemistry]});
var raj = new Node({id:"raj",isA:student,isPartOf:[chemistry]});



console.assert(shakkir.getParents() instanceof Array, failed");
console.assert(shakkir.getParents() instanceof Array, failed");