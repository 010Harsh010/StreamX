export default class AuthService {
  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SERVER}/api/v1/users`;
  }

  async verifyEmail({ username, authResult, newPassword }) {
    try {
      const code = authResult["code"];
      const response = await fetch(`${this.baseUrl}/verify-email`, {
        method: "POST",
        body: JSON.stringify({ username, password: newPassword, code }),
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "include",
      });
      if (!response) {
        throw new Error("no account found !!!");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async googlelogin({authResult}){
    const code = authResult["code"];
    console.log("code",code);
      const response = await fetch(`${this.baseUrl}/googlelogin`,{
        method: "POST",
        body: JSON.stringify({code}),
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "include",
      });
      if (!response) {
        throw new Error("no account found !!!");
      }
      const data = await response.json();
      return data;
  }
  async sendmessage({ message }) {
    console.log(message);

    try {
      const response = await fetch(`${this.baseUrl}/sendmessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Add Content-Type header
        },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({
          message: message, // Ensure message is correctly passed
        }),
      });
      const data = await response.json();
      console.log(data);
      if (data.statusCode !== 200) {
        throw new Error("Unable To send message");
      }
      return data;
    } catch (error) {
      throw new Error("Unable to send Message");
    }
  }
  async setrefreshtoken({ authResult }) {
    try {
      const code = authResult["code"];
      const response = await fetch(
        `${this.baseUrl}/setrefreshtoken?code=${code}`,
        {
          method: "POST",
          mode: "cors",
          credentials: "include",
        }
      );
      if (!response) {
        throw new Error("Unable to fetch token");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
      throw new Error("Unable to get tokens");
    }
  }
  async havetoken() {
    try {
      const response = await fetch(`${this.baseUrl}/havetoken`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
      });
      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }

  async editdescription({ description }) {
    const body = {
      description: description,
    };

    try {
      const response = await fetch(`${this.baseUrl}/editdescription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        mode: "cors",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to update description");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async register({
    fullName,
    password,
    username,
    avatar,
    coverImage,
    authResult,
  }) {
    const code = authResult["code"];
    const formData = new FormData(); // Capital "F"
    formData.append("fullName", fullName);
    formData.append("password", password);
    formData.append("username", username);
    formData.append("avatar", avatar);
    formData.append("coverImage", coverImage);
    formData.append("code", code);

    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      body: formData,
      mode: "cors",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to register user");
    }
    console.log(response);
    return await response.json();
  }

  async login({ username, password }) {
    const body = username.includes("@")
      ? { email: username, password }
      : { username, password };

    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      mode: "cors",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to login user");
    }
    const data = await response.json();
    return data;
  }

  async logout() {
    const response = await fetch(`${this.baseUrl}/logout`, {
      method: "POST",
      credentials: "include",
      mode:"cors"
    });
    if (!response.ok) {
      throw new Error("Failed to logout user");
    }
    return await response.json();
  }

  async refreshToken() {
    const response = await fetch(`${this.baseUrl}/refresh-token`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }
    return await response.json();
  }

  async changePassword({ oldPassword, newPassword }) {
    const response = await fetch(`${this.baseUrl}/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Unable to change password");
    }
    return await response.json();
  }

  async updateAccountDetails({ fullName, email }) {
    const response = await fetch(`${this.baseUrl}/update-account`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email }),
      mode: "cors",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Unable to update account details");
    }
    return await response.json();
  }

  async updateAvatar({ avatar }) {
    const formData = new FormData();
    formData.append("avatar", avatar);

    const response = await fetch(`${this.baseUrl}/avatar`, {
      method: "PATCH",
      body: formData,
      mode: "cors",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Unable to update avatar");
    }
    return await response.json();
  }

  async updateCoverImage({ coverImage }) {
    const formData = new FormData();
    formData.append("coverImage", coverImage);

    const response = await fetch(`${this.baseUrl}/update-cover-image`, {
      method: "PATCH",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Unable to update cover image");
    }
    return await response.json();
  }

  async channelProfile({ username }) {
    const response = await fetch(
      `${this.baseUrl}/channel-profile/${username}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Unable to fetch channel profile");
    }
    return await response.json();
  }

  async getHistory() {
    const response = await fetch(`${this.baseUrl}/history`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Unable to fetch history");
    }
    return await response.json();
  }

  async addWatchHistory({ videoId }) {
    const response = await fetch(
      `${this.baseUrl}/add-watch-history/${videoId}`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Unable to add video to history");
    }
    return await response.json();
  }
  async currentuser() {
    const response = await fetch(`${this.baseUrl}/current-user`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    
    if (!response.ok) {

      return null;
    }
    return await response.json();
  }
  async deleteAllHistory() {
    const response = await fetch(`${this.baseUrl}/delete-all-history`, {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Unable to delete history");
    }
    return await response.json();
  }
  async deleteHistory({ videoId }) {
    const response = await fetch(`${this.baseUrl}/delete-history/${videoId}`, {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Unable to delete history");
    }
    return await response.json();
  }
  async searchUser({ username = "", email = "" }) {
    try {
      if (username === "" && email === "") {
        return;
      }
      let body;
      if (username === "") {
        body = {
          email: email,
        };
      } else {
        body = {
          username: username,
        };
      }

      const response = await fetch(
        `${this.baseUrl}/getuserprofile`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );

      if (!response) {
        throw new Error("Invalid User");
      }
      return await response.json();
    } catch (error) {
      throw new Error("Invalid User");
    }
  }
}
