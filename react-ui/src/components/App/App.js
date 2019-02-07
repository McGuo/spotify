import React, { Component } from "react";
import "./App.css";
import SpotifyWebApi from "spotify-web-api-js";
import Card from "../Card/";
import ScrollableContainer from "../ScrollableContainer/";
import NeonBox from "../NeonBox/";
import Loader from "../Loader/";

const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor() {
    super();
    // Getting the parameters from the url
    const params = this.getHashParams();
    // Getting the hashed token
    const token = params.access_token;

    if (token) {
      spotifyApi.setAccessToken(token);
    }

    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: {
        songName: "",
        albumArt: "",
        artistNames: [],
        trackDetails: null
      },
      recentlyPlayed: [],
      stillLoading: true,
      isPlaying: false,
      warning: { status: false, message: "" },
      url: ""
    };
  }
  getHashParams = () => {
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
  };
  // Gets the recently played tracks of the user
  getRecentlyPlayed = async () => {
    try {
      const response = await spotifyApi.getMyRecentlyPlayedTracks({
        limit: 10
      });
      console.log(response.items);

      this.setState({ recentlyPlayed: response.items });
    } catch (e) {
      console.log(e.response);
    }
  };

  // Gets the currently playing track
  getNowPlaying = async () => {
    try {
      const { loggedIn, nowPlaying, isPlaying, warning } = this.state;
      // Check the current track that is playing
      const response = await spotifyApi.getMyCurrentPlaybackState();
      const trackDetails = await spotifyApi.getAudioFeaturesForTrack(
        response.item.id
      );

      if (response) {
        const song = response.item;
        if (loggedIn && song.name !== nowPlaying.songName) {
          console.log("skipped song!");
          // Update state pls!
          setTimeout(() => {
            this.getRecentlyPlayed();
          }, 4000);
        }

        if (response.is_playing !== isPlaying) {
          this.setState({ isPlaying: response.is_playing });
        }

        if (warning.status) {
          this.setState({ warning: { status: false } });
        }

        this.setState({
          nowPlaying: {
            songName: song.name,
            albumArt: song.album.images[0].url,
            artistNames: song.artists,
            trackDetails: trackDetails
          },
          stillLoading: false
        });
      } else {
        // The response was undefined.
        // Meaning: The user is not currently playing a track
        this.setState({
          warning: {
            status: true,
            message: "please play spotify to see your current track"
          },
          stillLoading: false
        });
        this.getRecentlyPlayed();
      }
    } catch (e) {
      console.log(e);
    }
  };

  renderNowPlaying = () => {
    const { loggedIn, stillLoading, warning, isPlaying } = this.state;
    // Can't fit everything in one line sad face
    const { nowPlaying, url } = this.state;

    let currPlaying;

    if (!loggedIn) {
      currPlaying = (
        <div>
          <a href={url} className="medium ui spotify inverted button">
            <i className="spotify icon green" />
            Log in to get started
          </a>
        </div>
      );
    } else if (stillLoading) {
      currPlaying = <Loader />;
    } else if (warning.status) {
      currPlaying = (
        <h1 style={{ "font-family": "Monoton" }}>{warning.message}</h1>
      );
    } else {
      currPlaying = (
        <div>
          <NeonBox isPlaying={isPlaying} text="ON AIR" />
          <Card
            src={nowPlaying.albumArt}
            title={nowPlaying.songName}
            description={nowPlaying.artistNames}
            extra_content={`Danceability: ${
              this.state.nowPlaying.trackDetails.danceability
            }`}
          />
        </div>
      );
    }
    return currPlaying;
  };

  componentDidMount = async () => {
    // Check the build of react and sets correct urls
    if (process.env.NODE_ENV !== "production") {
      this.setState({
        url: "http://localhost:5000/login"
      });
    } else {
      this.setState({
        url: "https://pacific-sands-61806.herokuapp.com/login"
      });
    }
    // We are going to check the playback state every interval of one second
    this.intervalId = await setInterval(() => {
      if (this.state.loggedIn) {
        this.getNowPlaying();
      }
    }, 1000);
  };

  // Make sure to clear the interval if we unmount
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    return (
      <div className="App">
        <div className="nowPlaying">{this.renderNowPlaying()}</div>
        <div>
          {this.state.recentlyPlayed.length !== 0 && (
            <div>
              <h4 className="ui horizontal divider" style={{ color: "white" }}>
                what you've been listening to
              </h4>
              <ScrollableContainer recentlyPlayed={this.state.recentlyPlayed} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
