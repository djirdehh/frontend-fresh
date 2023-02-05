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

      if (email.trim() === "" || email == null) {
        return setError("Your email address is required!");
      }

      const res = await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Token ${import.meta.env.VITE_BUTTONDOWN_API_KEY}`,
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
        const text = await res.text();
        throw new Error(text);
      }

      setUserSubscribed(true);
      setError(undefined);
    } catch (err) {
      console.log(err);
      setError(
        "Uh oh, something went wrong. Try again soon or reach out to me directly @ hassan.djirdeh@gmail.com."
      );
    } finally {
      setLoading(false);
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
      <div className="flex flex-row flex-wrap space-x-0 space-y-4 justify-center md:flex-nowrap md:space-x-4 md:space-y-0 mt-5">
        <input
          className="text-sm focus:ring-blue-500 focus:border-blue-500 shadow appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 font-mono text-gray-700 leading-tight focus:shadow-outline"
          value={name}
          onChange={(e) => setName(e.target.value)}
          id="name"
          type="text"
          placeholder="First name (optional)"
          disabled={loading}
        />
        <input
          className="text-sm focus:ring-blue-500 focus:border-blue-500 shadow appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 font-mono text-gray-700 leading-tight focus:shadow-outline"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
          type="email"
          placeholder="Email address (required)"
          disabled={loading}
        />
        <button
          disabled={email.trim() === "" || email == null || loading}
          className="px-3 text-sm font-mono tracking-tighter font-semibold bg-black text-white rounded-lg shadow-sm h-10 disabled:opacity-25"
          onClick={subscribe}
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
    </>
  ) : (
    <>
      <p className="text-4xl mt-5">💥</p>
      <p className="text-md font-mono mt-5 font-bold">
        You've subscribed! You can expect an email to hit your inbox shortly!
      </p>
    </>
  );

  return (
    <div className="h-full bg-white">
      <div className="h-full grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center p-5 md:p-10">
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
        <div className="h-full hidden md:block">
          <img
            style={{ width: "100%", minHeight: "100vh", objectFit: "cover" }}
            src="https://cdn.discordapp.com/attachments/1063230152827469944/1069415136407863358/hassan_dj_screensaver_wallpaper_white_background_hip_hop_graffi_24fa86af-10e2-44d8-91eb-73f6332b27c0.png"
          />
        </div>
        <p className="text-xs font-mono mt-5 fixed bottom-0 left-0 bg-white lg:bg-inherit w-full pl-2 pt-2 pb-2 text-left">
          <sup>*</sup>RSS feed and archive coming soon...
        </p>
      </div>
    </div>
  );
}

export default App;
