import React from "react";
import Loader from "../Loader";
import NeonBox from "../NeonBox";
import Card from "../Card";

import "./NowPlaying.css";
import "../../../node_modules/react-vis/dist/style.css";
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalBarSeries,
  DiscreteColorLegend
} from "react-vis";

class NowPlaying extends React.Component {
  generateBarData = async topTracks => {};
  renderBarChart = (trackDetails, topTracks) => {
    let barChart;
    if (trackDetails) {
      const currTrackData = [
        { x: "Acoustic", y: Math.floor(trackDetails.acousticness * 100) },
        {
          x: "Danceability",
          y: Math.floor(trackDetails.danceability * 100)
        },
        { x: "Energy", y: Math.floor(trackDetails.energy * 100) },
        { x: "Liveness", y: Math.floor(trackDetails.liveness * 100) }
      ];

      const songs = topTracks.audio_features;

      let profileData = {
        Acoustic: 0,
        Danceability: 0,
        Energy: 0,
        Liveness: 0
      };
      songs.forEach(song => {
        // console.log(song.danceability);

        profileData["Acoustic"] += song.acousticness;
        profileData["Danceability"] += song.danceability;
        profileData["Energy"] += song.energy;
        profileData["Liveness"] += song.liveness;
      });

      profileData["Acoustic"] = Math.floor(
        (profileData["Acoustic"] / 50) * 100
      );
      profileData["Danceability"] = Math.floor(
        (profileData["Danceability"] / 50) * 100
      );
      profileData["Energy"] = Math.floor((profileData["Energy"] / 50) * 100);
      profileData["Liveness"] = Math.floor(
        (profileData["Liveness"] / 50) * 100
      );

      let finalData = [];

      Object.keys(profileData).forEach(function(key) {
        finalData.push({
          x: key,
          y: profileData[key]
        });
      });

      barChart = (
        <XYPlot
          xType="ordinal"
          width={300}
          height={300}
          xDistance={100}
          yDomain={[0, 100]}
        >
          <DiscreteColorLegend
            orientation="horizontal"
            items={[
              {
                title: "Current Track Playing",
                color: "#9cedff"
              },
              {
                title: "Favorite songs (6 months)",
                color: "#dd9183"
              }
            ]}
          />
          <XAxis
            style={{
              text: { fill: "#fff" }
            }}
            hideLine
          />
          {/* <YAxis
            style={{
              text: { fill: "#fff" }
            }}
          /> */}

          <VerticalBarSeries
            data={currTrackData}
            color="#9cedff"
            opacity={0.8}
          />
          <VerticalBarSeries data={finalData} color="#dd9183" opacity={0.8} />
        </XYPlot>
      );
    }

    return barChart;
  };

  renderNowPlaying = () => {
    const { loggedIn, nowPlaying, url, topTracks } = this.props;
    let currPlaying;
    if (!loggedIn) {
      currPlaying = (
        <div className="ui three column centered grid">
          <div className="nowPlayingHeader column">
            <a href={url} className="medium ui spotify inverted button">
              <i className="spotify icon green" />
              Log in to get started
            </a>
          </div>
        </div>
      );
    } else if (nowPlaying.stillLoading) {
      currPlaying = (
        <div className="ui three column centered grid">
          <div className="nowPlayingHeader column">
            <Loader />
          </div>
        </div>
      );
    } else if (nowPlaying.warning.status) {
      currPlaying = (
        <div className="nowPlayingHeader column">
          <h1 style={{ "font-family": "Monoton" }}>
            {nowPlaying.warning.message}
          </h1>
        </div>
      );
    } else {
      currPlaying = (
        <div className="ui three column centered grid">
          <div className="column">
            <NeonBox isPlaying={nowPlaying.isPlaying} text="ON AIR" />
          </div>
          <div className="stackable three column row">
            <div className="column" />
            <div className="column nowPlaying">
              <Card
                src={nowPlaying.albumArt}
                title={nowPlaying.songName}
                description={nowPlaying.artistNames}
              />
            </div>
            <div className="column barChart">
              {this.renderBarChart(nowPlaying.trackDetails, topTracks)}
            </div>
          </div>
        </div>
      );
    }
    return currPlaying;
  };
  render() {
    return this.renderNowPlaying();
  }
}

export default NowPlaying;
