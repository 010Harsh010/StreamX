export class others {
  constructor() {
    this.baseurl = `${import.meta.env.VITE_SERVER}/api/v1`;
  }


  async roomExists({
    roomId
  }){
    const response = await fetch(`${this.baseurl}/live/roomExists`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({roomId:roomId}),
      mode:"cors",
      credentials: "include",
    });
    const data = await response.json();
    return data;
  }
  async stremmerData({ roomId }) {
    const response = await fetch(
      `${this.baseurl}/live/streamerData/${roomId}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    // if (response.status!==200){
    //   throw new Error("no response");
    // }
    return await response.json();
  }
  async fetchMessage({ roomId }) {
    const response = await fetch(`${this.baseurl}/live/getMessages/${roomId}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    // if (response.status!==200){
    //   throw new Error("no response");
    // }
    return await response.json();
  }

  async subscriberdetails({ userId }) {
    const response = await fetch(
      `${this.baseurl}/subscriptions/subscriberdetails/${userId}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to get subscribed");
    }
    const data = response.json();
    return data;
  }
  async issubscribed({ channelId }) {
    const response = await fetch(
      `${this.baseurl}/subscriptions/issubscribed/${channelId}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to get subscribed");
    }
    return response.json();
  }
  async subscribe({ channelId }) {
    console.log(channelId);

    const response = await fetch(
      `${this.baseurl}/subscriptions/toggle-subscribe/${channelId}`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to Subsribe");
    }
    return response.json();
  }
  async totalSubscriber({ channelId }) {
    const response = await fetch(
      `${this.baseurl}/subscriptions/subscriber/${channelId}`,
      {
        method: "GET",
      }
    );
    if (!response) {
      throw new Error("Unable to get subscriber");
    }
    return response.json();
  }
  async totalSubscribed({ channelId }) {
    const response = await fetch(
      `${this.baseurl}/subscriptions/subscribed/${channelId}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to get subscribed");
    }
    return response.json();
  }
  async allsubdetail({ id }) {
    const response = await fetch(
      `${this.baseurl}/subscriptions/getsubscriptiondetail/${id}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unale to fetch");
    }
    return response.json();
  }

  /**
   *
   * TWEET CONTENTS
   *
   */
  async newTweet({ content, file }) {
    let response;
  
    const formData = new FormData();
    formData.append("content", content);
  
    if (file) {
      formData.append("file", file);
  
      response = await fetch(`${this.baseurl}/tweets/tweet`, {
        method: "POST",
        body: formData, // No need for Content-Type header
        mode: "cors",
        credentials: "include",
      });
    } else {
      response = await fetch(`${this.baseurl}/tweets/tweet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
        mode: "cors",
        credentials: "include",
      });
    }
  
    if (!response.ok) {
      throw new Error("Unable to create new tweet");
    }
  
    return response.json();
  }
  async userTweet({ userId, prevId }) {
    let url;
    if (prevId === "null") {
      url = `${this.baseurl}/tweets/get-tweet/${userId}`;
    } else {
      url = `${this.baseurl}/tweets/get-tweet/${userId}?prevId=${prevId}`;
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
  }
  catch(error) {
    console.error("Error fetching video list:", error);
    throw error;
  }
  async updatetweet({ content, tweetId }) {
    try {
      const response = await fetch(
        `${this.baseurl}/tweets/updatetweet/${tweetId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
          mode: "cors",
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update tweet");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating tweet:", error.message);
      throw error;
    }
  }

  async deleteTweet({ tweetId }) {
    const response = await fetch(
      `${this.baseurl}/tweets/deletetweet/${tweetId}`,
      {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to delete tweet");
    }
    return response.json();
  }

  /***
   * Comments Slide
   */

  async addComment({ content, videoId }) {
    const response = await fetch(
      `${this.baseurl}/comments/addcomment/${videoId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to add comment");
    }
    return response.json();
  }
  async getComment({ videoId, prevId }) {
    let response = {};
    if (prevId === "null") {
      response = await fetch(
        `${this.baseurl}/comments/getcomments/${videoId}`,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );
    } else {
      response = await fetch(
        `${this.baseurl}/comments/getcomments/${videoId}?prevId=${prevId}`,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
        }
      );
    }
    if (!response) {
      throw new Error("Unable to get comment");
    }
    return response.json();
  }
  async updateComment({ content, commentId }) {
    const response = await fetch(
      `${this.baseurl}/comments/updated-comment/${commentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to update comment");
    }
    return response.json();
  }
  async deleteComment({ commentId }) {
    const response = await fetch(
      `${this.baseurl}/comments/deletecomment/${commentId}`,
      {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to delete comment");
    }
    return response.json();
  }
  /*
   * Playlist Url's
   */
  async createPlaylist({ name, description }) {
    const response = await fetch(
      `${this.baseurl}/user-playlist/create/playlist`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to create playlist");
    }
    return response.json();
  }
  async getPlaylistByUserId({ userId }) {
    const response = await fetch(
      `${this.baseurl}/user-playlist/getuserplaylist/${userId}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`Unable to get playlist. Status: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();
    console.log(data);

    return data;
  }

  async getPlaylistByPlaylistId({ playlistId }) {
    const response = await fetch(
      `${this.baseurl}/user-playlist/getplaylistbyid/${playlistId}`,
      {
        method: "GET",
      }
    );
    if (!response) {
      throw new Error("Unable to get playlist");
    }
    return response.json();
  }
  async deletePlaylist({ playlistId }) {
    const response = await fetch(
      `${this.baseurl}/user-playlist/deleteplaylist/${playlistId}`,
      {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to delete playlist");
    }
    return response.json();
  }
  async addVideoToPlaylist({ videoId, playlistId }) {
    const response = await fetch(
      `${this.baseurl}/user-playlist/addvideo/${playlistId}/video/${videoId}`,
      {
        method: "PUT",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to add video to playlist");
    }
    return response.json();
  }
  async removeVideoPlaylist({ videoId, playlistId }) {
    const response = await fetch(
      `${this.baseurl}/user-playlist/deletevideo/${playlistId}/video/${videoId}`,
      {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to remove video from playlist");
    }
    return response.json();
  }
  async updatePlaylist({ name, description, playlistId }) {
    console.log(name);

    const response = await fetch(
      `${this.baseurl}/user-playlist/updateplaylist/${playlistId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to update playlist");
    }
    return response.json();
  }
  async deleteVideoPlaylist({ videoId, playlistId }) {
    const response = await fetch(
      `${this.baseurl}/user-playlist/deletevideo/${videoId}/video/${playlistId}`,
      {
        method: "DELETE",
      }
    );
    if (!response) {
      throw new Error("Unable to delete video from playlist");
    }
    return response.json();
  }
  async removeMultipleVideoFromPlaylist({ videos, playlistId }) {
    const response = await fetch(
      `${this.baseurl}/user-playlist/deletemultiplevideo/${playlistId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(videos),
      }
    );
    if (!response) {
      throw new Error("Unable to Delete Videos");
    }
    return response.json();
  }

  /**
   *  LIKES URL
   */
  async toggleVideoLike({ videoId }) {
    const response = await fetch(
      `${this.baseurl}/likes/togglevideo/${videoId}`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to toggle video like");
    }
    return response.json();
  }
  async toggleCommentlike({ commentId }) {
    const response = await fetch(
      `${this.baseurl}/likes/togglecomment/${commentId}`,
      {
        method: "POST",
      }
    );
    if (!response) {
      throw new Error("Unable to toggle comment like");
    }
    return response.json();
  }
  async toggleTweetLike({ tweetId }) {
    const response = await fetch(
      `${this.baseurl}/likes/toggletweet/${tweetId}`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );
    if (!response) {
      throw new Error("Unable to toggle tweet like");
    }
    return response.json();
  }
  async likedVideos() {
    const response = await fetch(`${this.baseurl}/likes/getlikedvideo`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!response) {
      throw new Error("Unable to get liked videos");
    }
    return response.json();
  }
  async likedComments() {
    const response = await fetch(`${this.baseurl}/likes/getlikedcomments`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!response) {
      throw new Error("Unable to get liked comments");
    }
    return response.json();
  }
  async likedTweets() {
    const response = await fetch(`${this.baseurl}/likes/getlikedtweet`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!response) {
      throw new Error("Unable to get liked tweets");
    }
    return response.json();
  }
  async getalltweet() {
    const response = await fetch(`${this.baseurl}/tweets/getalltweets`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!response) {
      throw new Error("Unable to get all tweets");
    }
    const data = await response.json();
    return data;
  }
}
