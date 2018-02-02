hexo.extend.helper.register('hello_plugin', function(page){
    this.log("Hello Plugin");
    return "hello plugin";
});
