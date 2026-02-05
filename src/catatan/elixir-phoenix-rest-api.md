---
title: Membangun REST API dengan Elixir dan Phoenix
created: 2024-09-29
modified: 2024-09-29
layout: tulisan
tags:
  - catatan
  - ide
eleventyExcludeFromCollections: true
---
- Generate project
	- `mix phx.new nama_project --binary-id --no-live --no-assets --no-html --no-dashboard --no-mailer`
	- `cd nama_project`
	- Extra: setup nix for project
	- Start database service
	- `mix ecto.create`
	- `mix phx.server`
	- `open localhost:4000`
- The First route
	- Create healthcheck controller
	- Create healthcheck router
- Generate module
	- `mix phx.gen.json Podcasts Episode episodes title description:text link duration:integer image season:integer episode:integer`
- Return xml

```elixir
  def index(conn, _params) do
    properties = Properties.list_properties()

    conn
    |> put_resp_content_type("text/xml")
    |> render("index.xml", properties: properties)
  end
```




```

## Other Notes

**[Apple Podcasts (formerly iTunes) RSS feed Requirements](https://help.apple.com/itc/podcasts_connect/#/itcb54353390)  
**To be accepted into Apple Podcasts and other directories, your podcast RSS feed must have the required fields and tags:  
- Title  
- Description  
- Artwork (1400x1400 px to 3000x3000 px at 72 dpi)  
- Podcast Category  
- Language  
- Explicit Rating

https://beyondwords.io/knowledge-base/how-to-optimize-podcast-rss-feed/