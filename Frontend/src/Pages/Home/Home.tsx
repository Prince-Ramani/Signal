import { Button } from "@/components/ui/button";
import Wrapper from "@/components/Wrapper";
import { useAuthUser } from "@/Context/authUserContext";
import { useWebsocket } from "@/Context/Websocket";

const Home = () => {
  const { authUser } = useAuthUser();
  const { sendPersonalMessage } = useWebsocket();

  const handleClick = () => {
    sendPersonalMessage({
      message: "hello",
      sendTo: "me",
      messageType: "Group",
    });
  };

  return (
    <Wrapper>
      <div className="border-1 border-white text-4xl p-2 w-full">
        {authUser?.username}

        <Button onClick={handleClick}>Send</Button>
      </div>
    </Wrapper>
  );
};

export default Home;
