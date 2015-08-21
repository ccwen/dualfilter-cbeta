var React=require("react");
var E=React.createElement;
var ksa=require("ksana-simple-api");
var DualFilter=require("ksana2015-dualfilter").Component;
var HTMLFileOpener=require("ksana2015-htmlfileopener").Component;
var theme_bootstrap=require("ksana2015-breadcrumbtoc/theme_bootstrap");
var BreadcrumbTOC=require("ksana2015-breadcrumbtoc").Component;
var db="cbeta";
var styles={
  container:{display:"flex"}
  ,dualfilter:{flex:1,height:"100%",overflowY:"auto"}
  ,rightpanel:{flex:2}
  ,input:{fontSize:"100%",width:"100%"}
}
var maincomponent = React.createClass({
  getInitialState:function() {
    return {items:[],hits:[],vposs:[],itemclick:" ",text:"",q:"",toc:[],
            vpos:0,localmode:false,ready:false};
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
        that.setState({items:items,hits:hits||[],vposs:vposs||[],q:tofind2,toc:res.toc},function(){
          that.fetchText(vposs[0]);
        });
      })
    });
  }
  ,fetchText:function(vpos){
    ksa.fetch({db:db,vpos:vpos,q:this.state.q},function(err,content){
      if (!content || !content.length) return;
      this.setState({vpos:vpos,text:content[0].text,hits:content[0].hits});  
    }.bind(this));
  }
  ,onItemClick:function(e) {
    this.fetchText(e.target.dataset.vpos);
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
  ,render: function() {
    if (!this.state.ready) return this.renderOpenKDB();
    return <div style={styles.container}>    
      <div style={styles.dualfilter}>
        <DualFilter items={this.state.items} 
          hits={this.state.hits}
          vpos={this.state.vposs}
          inputstyle={styles.input}
          tofind1="阿含"
          tofind2="阿羅漢"
          onItemClick={this.onItemClick}
          onFilter={this.onFilter} />
      </div>
      <div style={styles.rightpanel}>
      <BreadcrumbTOC toc={this.state.toc} theme={theme_bootstrap}/><br/>
        {this.renderText()}
      </div>
    </div>    
  }
});
module.exports=maincomponent;