import React from "react";
import Card from "../Card/";

const List = ({ recentlyPlayed }) => {
  const renderedSongs = recentlyPlayed.map(song => {
    return (
      <div>
        <Card
          src={song.track.album.images[0].url}
          title={song.track.album.name}
          description={song.track.artists}
        />
      </div>
    );
  });
  return <div className="RecentlyPlayed">{renderedSongs}</div>;
};

export default List;
