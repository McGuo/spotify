import React from "react";
import Loader from "../Loader";
import NeonBox from "../NeonBox";
import Card from "../Card";

class NowPlaying extends React.Component {
  renderNowPlaying = () => {
    const { loggedIn, nowPlaying, url } = this.props;
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
    } else if (nowPlaying.stillLoading) {
      currPlaying = <Loader />;
    } else if (nowPlaying.warning.status) {
      currPlaying = (
        <h1 style={{ "font-family": "Monoton" }}>
          {nowPlaying.warning.message}
        </h1>
      );
    } else {
      currPlaying = (
        <div>
          <NeonBox isPlaying={nowPlaying.isPlaying} text="ON AIR" />
          <Card
            src={nowPlaying.albumArt}
            title={nowPlaying.songName}
            description={nowPlaying.artistNames}
            extra_content={`Danceability: ${Math.round(
              nowPlaying.trackDetails.danceability * 100
            )}%`}
          />
        </div>
      );
    }
    return currPlaying;
  };
  render() {
    return <div className="nowPlaying">{this.renderNowPlaying()}</div>;
  }
}

export default NowPlaying;
