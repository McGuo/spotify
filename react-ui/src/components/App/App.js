import React, { Component } from "react";
import "./App.css";
import SpotifyWebApi from "spotify-web-api-js";
import Card from "../Card/";
import ScrollableContainer from "../ScrollableContainer/";
import NeonBox from "../NeonBox/";

const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor() {
    super();
    const params = this.getHashParams();
    const token = params.access_token;

    if (token) {
      spotifyApi.setAccessToken(token);
    }

    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: { songName: "", albumArt: "", artistNames: [] },
      recentlyPlayed: [],
      stillLoading: true,
      isPlaying: false,
      warning: false,
      message: "",
      url: "https://pacific-sands-61806.herokuapp.com/login"
    };
  }
  getHashParams() {
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  async getRecentlyPlayed() {
    try {
      const response = await spotifyApi.getMyRecentlyPlayedTracks({
        limit: 10
      });
      console.log(response.items);

      this.setState({
        recentlyPlayed: response.items
      });
    } catch (e) {
      console.log(e.response);
    }
  }

  async getNowPlaying() {
    try {
      const response = await spotifyApi.getMyCurrentPlaybackState();

      if (response) {
        const song = response.item;
        if (
          this.state.loggedIn &&
          song.name !== this.state.nowPlaying.songName
        ) {
          console.log("skipped song!");
          setTimeout(() => {
            this.getRecentlyPlayed();
          }, 4000);
        }

        if (response.is_playing !== this.state.isPlaying) {
          this.setState({ isPlaying: response.is_playing });
        }

        if (this.state.stillLoading === true) {
          this.setState({
            stillLoading: false
          });
        }

        if (this.state.warning) {
          this.setState({
            warning: !this.state.warning
          });
        }

        this.setState({
          nowPlaying: {
            songName: song.name,
            albumArt: song.album.images[0].url,
            artistNames: song.artists
          }
        });
      } else {
        if (this.state.warning) {
          this.getRecentlyPlayed();
        } else {
          this.setState({
            warning: true,
            message: "please play spotify to see your current track",
            stillLoading: false
          });
          this.getRecentlyPlayed();
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  async componentDidMount() {
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
      this.setState({
        url: "http://localhost:5000/login"
      });
    }

    this.intervalId = await setInterval(() => {
      if (this.state.loggedIn) {
        this.getNowPlaying();
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    return (
      <div className="App">
        <div className="nowPlaying">
          {!this.state.loggedIn && (
            <div>
              <a
                href={this.state.url}
                className="medium ui spotify inverted button"
              >
                <i className="spotify icon green" />
                Log in to get started
              </a>
            </div>
          )}
          {this.state.loggedIn &&
            !this.state.stillLoading &&
            !this.state.warning && (
              <div>
                <NeonBox isPlaying={this.state.isPlaying} text="ON AIR" />
                <Card
                  src={this.state.nowPlaying.albumArt}
                  title={this.state.nowPlaying.songName}
                  description={this.state.nowPlaying.artistNames}
                />
              </div>
            )}
          {this.state.stillLoading &&
            this.state.loggedIn &&
            !this.state.warning && (
              <div className="ui active inline big loader inverted" />
            )}
          {this.state.warning && (
            <h1 style={{ "font-family": "Monoton" }}>{this.state.message}</h1>
          )}
        </div>
        <div>
          {this.state.recentlyPlayed.length !== 0 && (
            <div className="ui">
              <h4 className="ui horizontal divider" style={{ color: "white" }}>
                what you've been listening to
              </h4>
            </div>
          )}
          <ScrollableContainer recentlyPlayed={this.state.recentlyPlayed} />
        </div>
      </div>
    );
  }
}

export default App;
