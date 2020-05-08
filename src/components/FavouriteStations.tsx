import * as React from "react";
import { ItemList, ListItem } from "./FuzzyOverlay";
import { useLocalStorage, SearchHeading } from "./App";
import starIcon from "../assets/star.png";
import styled from "styled-components";

interface StarProps {
  checked: boolean;
}

const Star = styled.img<StarProps>`
  opacity: ${(p) => (p.checked ? 1 : 0.4)};
`;

export const FavouriteStar = (props: { stationName: string }) => {
  const { stationName } = props;
  const [favourites, setFavourites] = useLocalStorage<string[]>(
    "favourites",
    []
  );

  const handleClick = (e) => {
    const favSet = new Set(favourites);
    if (favSet.has(stationName)) {
      favSet.delete(stationName);
    } else {
      favSet.add(stationName);
    }
    console.log(favSet, stationName);

    setFavourites(Array.from(favSet));
  };

  return (
    <Star
      checked={favourites.includes(stationName)}
      src={starIcon}
      onClick={handleClick}
    ></Star>
  );
};

export const FavouriteStations = (props: { handleClick: (e) => void }) => {
  const [favourites, s] = useLocalStorage<string[]>("favourites", []);

  const { handleClick } = props;
  if (favourites.length === 0) return null;

  return (
    <div>
      <SearchHeading>Saved Stations</SearchHeading>
      <ItemList>
        {favourites.map((f, i) => (
          <ListItem key={i} onClick={handleClick} children={f} />
        ))}
      </ItemList>
    </div>
  );
};
