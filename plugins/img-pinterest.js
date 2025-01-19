const axios = require("axios")

class pinterestsearch {
search = async function pinterest(query) {
  const {
    data
  } = await axios.get(`https://www.pinterest.com/resource/BaseSearchResource/get/`, {
    params: {
      source_url: `/search/pins/?q=${query}`,
      data: JSON.stringify({
        options: {
          isPrefetch: false,
          query: query,
          scope: "pins",
          no_fetch_context_on_resource: false
        },
        context: {}
      })
    }
  });
  const container = [];
  const results = data.resource_response.data.results.filter(v => v.images?.orig);
  results.forEach(result => {
    container.push({
      upload_by: result.pinner.username,
      fullname: result.pinner.full_name,
      followers: result.pinner.follower_count,
      caption: result.grid_title,
      image: result.images.orig.url,
      source: "https://id.pinterest.com/pin/" + result.id
    });
  });
  return container;
}
}

module.exports = new pinterestsearch()