var React=require("react");
require("ksana2015-webruntime/livereload")(); 
var ksanagap=require("ksana2015-webruntime/ksanagap");
ksanagap.boot("dualfilter-cbeta",function(){
	var Main=React.createElement(require("./src/main.jsx"));
	ksana.mainComponent=React.render(Main,document.getElementById("main"));
});