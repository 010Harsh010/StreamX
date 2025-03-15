export class VideoMethods {
  constructor() {
    this.baseurl = `${import.meta.env.VITE_SERVER}/api/v1/video`;
  }
  async uploadVideo({ title, description, videoFile, thumbnail }) {

    console.log(title, description, videoFile, thumbnail);
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile); // Ensure key matches backend
    formData.append("thumbnail", thumbnail);
    const response = await fetch(`${this.baseurl}/upload-video`, {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "include",
    });
    if (!response) {
      throw new Error("Failed to upload video");
    }
    return response.json();
  }
  async videoDetail({ videoId }) {
    const response = await fetch(`${this.baseurl}/video-details/${videoId}`, {
      method: "GET",
    });
    if (!response) {
      throw new Error("Unable to Fetch Video");
    }
    return response.json();
  }
  async updateVideo({ title, description, videoFile, thumbnail, videoid }) {
    // console.log( title, description, videoFile, thumbnail, videoid );

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile); // Ensure key matches backend
    formData.append("thumbnail", thumbnail);

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]); // Log to verify keys and values
    }

    const response = await fetch(`${this.baseurl}/updateVideo/${videoid}`, {
      method: "PATCH",
      body: formData,
      mode: "cors",
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to update video");
    }
    
    const data = await response.json();
    return data;
  }
  async deleteVideo({ videoid }) {
    const response = await fetch(`${this.baseurl}/deletevideo/${videoid}`, {
      method: "DELETE",
      mode:"cors",
      credentials: "include",
    });
    if (!response) {
      throw new Error("Failed to delete video");
    }
    return response.json();
  }
  async getVideoList({ userId, lastId }) {
    try {
      let url;
      if (lastId === "null") {
        url = `${this.baseurl}/getvideos/${userId}`;
      } else {
        url = `${this.baseurl}/video/${userId}?lastid=${lastId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch video list: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching video list:", error);
      throw error;
    }
  }

  async publishVideo({ videoId }) {
    const response = await fetch(`${this.baseurl}/video-publish/${videoId}`, {
      method: "PATCH",
      mode:"cors",
      credentials:"include"
    });
    if (!response) {
      throw new Error("Failed to publish video");
    }
    return response.json();
  }
  async getallvideo({ page, prevId }) {
    const response = await fetch(`${this.baseurl}/getallvideos`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body:JSON.stringify({
        page:page,
        prevId:prevId
      })
    });
    if (!response) {
      throw new Error("Failed to fetch all video");
    }
    return response.json();
  }
  async suggestedVideo({videoId,page}){
      const response = await fetch(`${this.baseurl}/recommandation`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId:videoId,
          page:page
        })
      });
      if (!response || response.status!==200){
        throw new Error("Failed to fetch suggested video");
      }
      return await response.json();
  }
  async fetchRecommendation({page}){
    console.log("send");
    const response = await fetch(`${this.baseurl}/homerecommendation`,{
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page:page
      })
    });
    console.log(response);
    if (response.status!==200){
      throw new Error("Failed to fetch recommendation");
    }
    return await response.json();
  }
  async generalChoice({description,page}) {
    const response = await fetch(`${this.baseurl}/generalChoice`,{
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description:description,
          page:page
        
      })
    });
    if (!response || response.status!==200){
      throw new Error("Failed to fetch general choice");
    }
    return await response.json();
  }
}
