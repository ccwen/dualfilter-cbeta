/*
TODO _@80 cannot navigate
*/
var React=require("react");
var E=React.createElement;
var ksa=require("ksana-simple-api");
var DualFilter=require("ksana2015-dualfilter").Component;
var HTMLFileOpener=require("ksana2015-htmlfileopener").Component;
var theme_bootstrap=require("ksana2015-breadcrumbtoc/theme_bootstrap");
var BreadcrumbTOC=require("ksana2015-breadcrumbtoc").Component;
var SegNav=require("ksana2015-segnav").Component;
var db="cbeta";
var styles={
  container:{display:"flex"}
  ,dualfilter:{flex:1,height:"100%",overflowY:"auto"}
  ,rightpanel:{flex:3}
  ,input:{fontSize:"100%",width:"100%"}
}
var maincomponent = React.createClass({
  getInitialState:function() {
    return {items:[],hits:[],vposs:[],itemclick:" ",text:"",tofind1:"",q:"",toc:[],
            vpos:0,localmode:false,ready:false,segnames:[],txtid:""};
  }
  ,componentDidMount:function() {
    ksa.tryOpen(db,function(err){
      if (!err) {
        this.setState({ready:true});
      } else {
        this.setState({localmode:true});
      }
    }.bind(this));
  }
  ,onFilter:function(tofind1,tofind2) {
    var that=this;
    ksa.filter({db:db,regex:tofind1,q:tofind2,field:"mulu"},function(err,items,hits,vposs){
      ksa.toc({db:db,q:tofind2,tocname:"mulu"},function(err,res){
        that.setState({items:items,tofind1:tofind1,vposs:vposs||[],q:tofind2,toc:res.toc},function(){
          that.fetchText(vposs[0]);
        });
        if (!that.state.segnames.length) {
          ksa.get(db,"segnames",function(segnames){
            that.setState({segnames: segnames});
          });
        }
      })
    });
  }
  ,fetchText:function(vpos){
    ksa.fetch({db:db,vpos:vpos,q:this.state.q},function(err,content){
      if (!content || !content.length) return;
      this.setState({vpos:vpos,text:content[0].text,hits:content[0].hits,txtid:content[0].uti}); 

    }.bind(this));
  }
  ,onItemClick:function(e) {
    this.fetchText(parseInt(e.target.dataset.vpos));
  }
  ,renderText:function() {
    return ksa.renderHits(this.state.text,this.state.hits,E.bind(null,"span"));
  }
  ,onFileReady:function(files) {
    this.setState({localmode:false,ready:true});
    db=files[db];//replace dbid with HTML File handle
  }
  ,renderOpenKDB:function() {
    if (!this.state.localmode)return <div>Loading {db}</div>;
    return <div>
      <h2>Dual Filter for CBETA</h2>
      <HTMLFileOpener onReady={this.onFileReady}/>
      <br/>Google Chrome Only
      <br/><a target="_new" href="https://github.com/ksanaforge/dualfilter-sample">Github Repo</a>
    </div>
  }
  ,onBreadcrumbSelect:function(itemidx,vpos) {
    this.fetchText(vpos);
  }
  ,onGoSegment:function(seg) {
    ksa.txtid2vpos(db,seg,function(err,vpos){
      if (!err) this.fetchText(vpos);
    }.bind(this));
  }
  ,render: function() {
    if (!this.state.ready) return this.renderOpenKDB();
    return <div style={styles.container}>    
      <div style={styles.dualfilter}>
        <DualFilter items={this.state.items} 
          hits={this.state.hits}
          vpos={this.state.vposs}
          inputstyle={styles.input}
          tofind1=""
          tofind2="淨土"
          onItemClick={this.onItemClick}
          onFilter={this.onFilter} />
      </div>
      <div style={styles.rightpanel}>

      <BreadcrumbTOC toc={this.state.toc} vpos={this.state.vpos} 
        theme={theme_bootstrap} keyword={this.state.tofind1} onSelect={this.onBreadcrumbSelect}/>

        <SegNav size={11} segs={this.state.segnames} value={this.state.txtid} onGoSegment={this.onGoSegment}/>
        <br/>
        {this.renderText()}
      </div>
    </div>    
  }
});
module.exports=maincomponent;