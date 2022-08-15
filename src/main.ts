import {
  getCredentials,
  GameServiceClient,
  EventServiceClient,
  StreamRequest,
  StreamResponse,
  ServiceError,
  StartGameRequest,
  StartGameResponse,
  AirplaneDetected,
  GameStopped,
} from "auto-traffic-control";

function subscribeToEvents(): void {
  const eventService = new EventServiceClient(
    "localhost:4747",
    getCredentials()
  );

  const stream = eventService.stream(new StreamRequest());
  stream.on("data", processMessage);
  stream.on("end", exit);
}

function startGame(): void {
  const gameService = new GameServiceClient("localhost:4747", getCredentials());

  gameService.startGame(new StartGameRequest(), (err) => {
    if (err != null) {
      throw err;
    }
  })
}

function main() {
  subscribeToEvents();
  startGame();
}

function processMessage(streamResponse: StreamResponse): void {
  const airplaneDetected = streamResponse.getAirplaneDetected();
  if (airplaneDetected != undefined) {
    updateFlightPlan(airplaneDetected);
  }

  const gameStopped = streamResponse.getGameStopped();
  if (gameStopped != undefined) {
    exit(gameStopped);
  }
}

function updateFlightPlan(event: AirplaneDetected): void {
  const airplane = event.getAirplane();
  if (airplane == undefined) {
    throw new Error("Received AirplaneDetected event without an airplane");
  }

  const id = airplane.getId();
  // console.log(airplane)
  const flightPlan = airplane.getFlightPlanList();
  // const nextNode = flightPlan.at(0);

  // console.log(`Detected airplane ${id} heading towards ${nextNode}.`);
  console.log(`Detected airplane ${id}.`);
}

function exit(event: GameStopped): void {
  const score = event.getScore();

  console.log(`Game stopped! Score: ${score}`);
  process.exit();
}

main()
