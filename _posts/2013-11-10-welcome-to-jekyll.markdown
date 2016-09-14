---
title:  "Hello World!"
date:   2016-11-10 10:18:00
description: Thriller Comedy Horror
---

You'll find this post in your `_posts` directory - edit this post and re-build (or run with the `-w` switch) to see your changes!
To add new posts, simply add a file in the `_posts` directory that follows the convention: YYYY-MM-DD-name-of-post.ext.

Now a little of Rust code <3

{% highlight rs %}
fn main() {
    let mut state = MainState::new();
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut rpc_looper = RpcLoop::new(stdout);

    rpc_looper.mainloop(|| stdin.lock(), &mut state);
}
{% endhighlight %}

Golang code
{% highlight golang %}
func main() {
    fmt.Println("Hello World")
}
{% endhighlight %}

Check out the [Jekyll docs][jekyll] for more info on how to get the most out of Jekyll. File all bugs/feature requests at [Jekyll's GitHub repo][jekyll-gh].

[jekyll-gh]: https://github.com/mojombo/jekyll
[jekyll]:    http://jekyllrb.com
