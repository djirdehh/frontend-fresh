import { useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | string>(undefined);
  const [userSubscribed, setUserSubscribed] = useState(false);

  const subscribe = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Token ${import.meta.env.BUTTONDOWN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          metadata: {
            firstName: name,
          },
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      setLoading(false);
      setUserSubscribed(true);
    } catch {
      setError("Uh oh something went wrong. Try again soon!");
    }
  };

  const content = !userSubscribed ? (
    <>
      <p className="text-lg font-mono mt-5">
        A weekly newsletter of front-end engineering tips, tutorials, and
        projects for beginner to intermediate web developers.
      </p>
      <p className="text-lg font-mono mt-5 font-bold">
        Ready to go from zero to hero?
      </p>
      <div className="flex flex-row mt-5">
        <input
          className="focus:ring-blue-500 focus:border-blue-500 shadow appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 font-mono text-gray-700 leading-tight focus:shadow-outline"
          value={name}
          onChange={(e) => setName(e.target.value)}
          id="name"
          type="text"
          placeholder="Your first name"
        />
        <input
          className="ml-5 focus:ring-blue-500 focus:border-blue-500 shadow appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 font-mono text-gray-700 leading-tight focus:shadow-outline"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
          type="email"
          placeholder="Your email address"
        />
        <button
          disabled={name == null || email == null}
          className="px-3 ml-5 font-mono tracking-tighter font-semibold bg-black text-white rounded-lg shadow-sm h-12 disabled:opacity-25"
          onClick={subscribe}
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
    </>
  ) : (
    <>
      <p className="text-4xl">💥</p>
      <p className="text-lg font-mono mt-5 font-bold">
        You've subscribed! Be sure to check your spam/promotions folders in your
        inbox if you can't find the welcome email.
      </p>
    </>
  );

  return (
    <div className="h-full bg-white">
      <div className="h-full grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center p-10">
          <div className="place-self-center text-center">
            <img className="w-96" style={{ margin: "0 auto" }} src={logo} />
            {content}
            {error && (
              <div className="mt-10">
                <p className="text-3xl">🚨</p>
                <p className="text-lg font-mono font-bold text-red-500">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="h-full">
          <img
            className="h-full"
            src="https://cdn.discordapp.com/attachments/1063230152827469944/1069415136407863358/hassan_dj_screensaver_wallpaper_white_background_hip_hop_graffi_24fa86af-10e2-44d8-91eb-73f6332b27c0.png"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
