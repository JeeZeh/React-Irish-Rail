import * as React from "react";
import { useState, useEffect } from "react";
import { hot } from "react-hot-loader";
import IrishRailApi, { Train, Journey } from "../api/IrishRailApi";
import * as Moment from "moment";
import styled from "styled-components";
import { JourneyMap } from "./JourneyMap";
import Collapsible from "react-collapsible";
import { ArrowDown, ArrowUp } from "react-feather";
import { MobileTrainCard } from "./MobileTrainCard";
import { useWindowSize } from "../hooks/useWindowSize";
import { DesktopTrainCard } from "./DesktopTrainCard";

const Table = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  padding: 15px;
  font-family: "Lato", sans-serif;
  transition: border 0.08s ease-out;

  @media only screen and (max-width: 900px) {
    padding: 0;
  }
`;

export const DesktopTrainRow = styled.div<{ header?: boolean }>`
  display: grid;
  grid-template-areas: due dep from to term last;
  grid-template-columns: 1fr 1.5fr 2.5fr 2.5fr 1fr 2.5fr;

  &:not(.header):hover {
    opacity: 0.8;
  }

  color: #444;
  font-weight: 700;
  user-select: none;
  cursor: pointer;
`;

const Body = styled.div`
  ${DesktopTrainRow} {
    cursor: pointer;
  }

  & > div:last-child {
    border-bottom: none;
  }
`;

interface JourneyCache {
  journey: Journey;
  time: number;
}

const ScheduleTable = (props: { trainData: Train[] }) => {
  const originalTrainData = [...props.trainData];
  const isPortable = useWindowSize().width < 900;
  const { trainData } = props;
  const defaultSort = "Expdepart";
  const [sort, setSort] = useState({ col: defaultSort, dir: 1 }); // 1 = Ascending, -1 Descending
  const [journeyCache, setJourneyCache] = useState(
    new Map<string, JourneyCache>()
  );
  const [sortedTrainData, setSortedTrainData] = useState([
    ...originalTrainData,
  ]);

  // Re-sort the train data when the user updates the sorting params
  useEffect(() => {
    const { col, dir } = sort;
    if (col && dir !== 0) {
      console.log("sorting by:", col, dir);
      sortedTrainData.sort((a, b) => {
        return (a[col] >= b[col] ? 1 : -1) * dir;
      });
      setSortedTrainData([...sortedTrainData]);
    } else {
      setSortedTrainData([...originalTrainData]);
    }
  }, [sort]);

  // Updates the sorting direction based on the selected heading
  const handleSort = (e) => {
    if (isPortable) {
      return;
    }
    const col = e.currentTarget.getAttribute("data-col");
    if (sort.col === col) {
      if (sort.dir === -1) {
        setSort({ ...sort, dir: 0 });
      } else {
        setSort({ ...sort, dir: sort.dir > 0 ? -1 : 1 });
      }
    } else {
      setSort({ col, dir: 1 });
    }
    console.log("Updated sorting");
  };

  const getJourney = async (journeyCode: string): Promise<Journey> => {
    const invalidateCacheAfter = 3000; // Invalidate after 3s
    let time = Date.now();
    let cachedJourney = journeyCache.get(journeyCode) ?? null;
    if (!cachedJourney || cachedJourney.time > invalidateCacheAfter) {
      const date = Moment().locale("en-gb").format("ll");
      const journey = await IrishRailApi.getTrainJourney(journeyCode, date);
      setJourneyCache(
        new Map(journeyCache.set(journeyCode, { journey, time }))
      );
      return journey;
    }

    return cachedJourney.journey;
  };

  const renderTrain = (train: Train) => {
    const code = train.Traincode;

    if (isPortable)
      return (
        <MobileTrainCard train={train} getJourney={getJourney} key={code} />
      );

    return (
      <DesktopTrainCard train={train} getJourney={getJourney} key={code} />
    );
  };

  const renderHeader = () => {
    return (
      <DesktopTrainRow header={true}>
        {scheduleColumns.map((c, i) => (
          <div onClick={(e) => handleSort(e)} key={i} data-col={c.propName}>
            {c.dispName}{" "}
            {sort.col === c.propName && sort.dir !== 0 && !isPortable ? (
              sort.dir === -1 ? (
                <ArrowUp />
              ) : (
                <ArrowDown />
              )
            ) : null}
          </div>
        ))}
      </DesktopTrainRow>
    );
  };

  return (
    <Table>
      {!isPortable ? renderHeader() : null}
      <Body>{trainData.map((t) => renderTrain(t))}</Body>
    </Table>
  );
};

export default hot(module)(ScheduleTable);

const testTrain: Train = {
  Servertime: null,
  Traincode: null,
  Stationfullname: null,
  Stationcode: null,
  Querytime: null,
  Traindate: null,
  Origin: "Dublin Connolly",
  Destination: "Limerick Junction",
  Origintime: "13:42",
  Destinationtime: "15:55",
  Status: null,
  Lastlocation: null,
  Duein: null,
  Late: null,
  Exparrival: "14:26",
  Expdepart: "14:30",
  Scharrival: null,
  Schdepart: null,
  Direction: null,
  Traintype: null,
  Locationtype: null,
};

export const scheduleColumns: Array<{
  dispName: string;
  propName: string;
}> = [
  {
    dispName: "Due",
    propName: "Exparrival",
  },
  {
    dispName: `Departs`,
    propName: "Expdepart",
  },
  {
    dispName: "From",
    propName: "Origin",
  },
  {
    dispName: "To",
    propName: "Destination",
  },
  {
    dispName: "Ends",
    propName: "Destinationtime",
  },
  {
    dispName: "Last Seen",
    propName: "Lastlocation",
  },
];
