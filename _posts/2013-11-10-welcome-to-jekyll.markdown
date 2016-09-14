---
title:  "Hello World!"
date:   2016-11-10 10:18:00
description: Thriller Comedy Horror
---

You'll find this post in your `_posts` directory - edit this post and re-build (or run with the `-w` switch) to see your changes!
To add new posts, simply add a file in the `_posts` directory that follows the convention: YYYY-MM-DD-name-of-post.ext.

Now a little of Rust code <3

{% highlight rust %}
impl Handler<W> for MainState {
    fn handle_notification(&mut self, ctx: RpcCtx<W>, method: &str, params: &Value) {
        match Request::from_json(method, params) {
            Ok(req) => {
                let _ = self.handle_req(req, ctx.get_peer());
                // TODO: should check None
            }
            Err(e) => print_err!("Error {} decoding RPC request {}", e, method)
        }
    }

    fn handle_request(&mut self, ctx: RpcCtx<W>, method: &str, params: &Value) ->
        Result<Value, Value> {
        match Request::from_json(method, params) {
            Ok(req) => {
                let result = self.handle_req(req, ctx.get_peer());
                result.ok_or_else(|| Value::String("return value missing".to_string()))
            }
            Err(e) => {
                print_err!("Error {} decoding RPC request {}", e, method);
                Err(Value::String("error decoding request".to_string()))
            }
        }
    }
}
{% endhighlight %}

Check out the [Jekyll docs][jekyll] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll's GitHub repo][jekyll-gh].

[jekyll-gh]: https://github.com/mojombo/jekyll
[jekyll]:    http://jekyllrb.com
