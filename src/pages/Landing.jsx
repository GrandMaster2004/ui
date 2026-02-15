import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const TicketCard = ({ color, children, className = "" }) => {
  return (
    <div
      className={`ticket-card ${className}`}
      style={{
        maskImage: `
          radial-gradient(circle at 10px 0, transparent 5px, white 5.5px),
          linear-gradient(to bottom, white, white)
        `,
        maskSize: "20px 20px, 100% calc(100% - 10px)",
        maskPosition: "top center, bottom center",
        maskRepeat: "repeat-x, no-repeat",
        WebkitMaskImage: `
          radial-gradient(circle at 10px 0, transparent 5px, white 5.5px),
          linear-gradient(to bottom, white, white)
        `,
        WebkitMaskSize: "20px 20px, 100% calc(100% - 10px)",
        WebkitMaskPosition: "top center, bottom center",
        WebkitMaskRepeat: "repeat-x, no-repeat",
      }}
    >
      <div
        className="ticket-card__inner"
        style={{
          background: color,
          maskImage: `
            radial-gradient(circle at 10px bottom, transparent 5px, white 5.5px),
            linear-gradient(to top, white, white)
          `,
          maskSize: "20px 20px, 100% calc(100% - 10px)",
          maskPosition: "bottom center, top center",
          maskRepeat: "repeat-x, no-repeat",
          WebkitMaskImage: `
            radial-gradient(circle at 10px bottom, transparent 5px, white 5.5px),
            linear-gradient(to top, white, white)
          `,
          WebkitMaskSize: "20px 20px, 100% calc(100% - 10px)",
          WebkitMaskPosition: "bottom center, top center",
          WebkitMaskRepeat: "repeat-x, no-repeat",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const hallOfFlex = [
  { user: "MS1_1500" },
  { user: "MYD9ALLAS" },
  { user: "WYERAILLAB" },
  { user: "MYRSAILLAR" },
  { user: "T6SMLLAS" },
  { user: "TGRAULAS" },
  { user: "TRBLAAS" },
  { user: "WTERALLLAD" },
];

const collageImages = [
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1470608756444-1343a7a555b0?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
];

export const LandingPage = () => {
  const location = useLocation();
  const [tickerTime, setTickerTime] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTickerTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.state?.scrollTo]);

  const tickerText = useMemo(() => {
    const formatted = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(tickerTime);

    return `MURDER YOUR MID COLLECTION • SLAY THE SLAB GAME • NO CAP • ACTIVATE, ${formatted}`;
  }, [tickerTime]);

  return (
    <div className="landing__page">
      <div className="landing__hero">
        <div className="landing__ticker" aria-live="polite">
          <div className="landing__ticker-track">
            <span className="landing__ticker-text">{tickerText}</span>
            <span className="landing__ticker-text" aria-hidden="true">
              {tickerText}
            </span>
          </div>
        </div>

        <div className="landing__hero-content">
          <div className="landing__hero-copy">
            <h1 className="landing__hero-title">Flex Your Grail.</h1>
            <h1 className="landing__hero-title">Get That 10.</h1>
            <h1 className="landing__hero-title">Iconic.</h1>

            <p className="landing__hero-text">
              Next-gen grading for the real new era.
              <br /> Aura-aura-boostier pookies.
            </p>

            <div className="landing__cta-group">
              <button
                onClick={() => navigate("/dashboard")}
                className="landing__cta landing__cta--violet"
                type="button"
              >
                Get My Cards
              </button>
              <button className="landing__cta landing__cta--fire" type="button">
                Explore The Drip
              </button>
            </div>
          </div>

          <div className="landing__hero-card">
            <div className="landing__card-frame">
              <div className="landing__card-border"></div>
              <div className="landing__card-shine"></div>
              <div className="landing__card-graphic">
                <svg viewBox="0 0 100 100">
                  <path d="M50 20c-15 0-25 10-25 25 0 10 5 15 10 20-5 5-5 15 0 20 8 8 20 5 20 5s12 3 20-5c5-5 5-15 0-20 5-5 10-10 10-20C85 30 75 20 60 20c-5 0-5 5-10 5-5 0-5-5-10-5z" />
                  <path d="M35 45c5 0 10-5 10-10" />
                  <path d="M65 45c-5 0-10-5-10-10" />
                  <path d="M40 60c5 5 15 5 20 0" />
                </svg>
                <div className="landing__card-chip">10</div>
              </div>
              <div className="landing__card-particle landing__card-particle--one"></div>
              <div className="landing__card-particle landing__card-particle--two"></div>
              <div className="landing__card-particle landing__card-particle--three"></div>
            </div>
          </div>
        </div>

        <div className="landing__grid-floor">
          <div className="landing__grid-pattern"></div>
        </div>
      </div>

      <div className="landing__content">
        <div className="landing__content-inner">
          <div className="landing__columns">
            <div className="landing__pricing" id="pricing-section">
              <div className="landing__pricing-head">
                <h2>Choose Your Energy</h2>
              </div>
              <div className="landing__tickets">
                <TicketCard color="#a855f7" className="landing__ticket">
                  <div className="landing__ticket-body">
                    <p className="landing__ticket-copy">
                      Standard service for standard people. No rush, just vibes.
                      Estimated completion whenever.
                    </p>
                    <div className="landing__ticket-main-text">
                      <h3 className="landing__ticket-title">'MID' TIER -</h3>
                      <p className="landing__ticket-price">$15 / CARD</p>
                    </div>
                    <div
                      className="landing__ticket-tag"
                      style={{ backgroundColor: "#fbbf24", color: "#000" }}
                    >
                      BRUH45GRK
                    </div>
                  </div>
                  <div className="landing__ticket-meta">
                    <div className="landing__ticket-meta-text">
                      NON-REFUNDABLE
                      <br /> VALID FOR ONE
                      <br /> SUBMISSION
                      <br /> TERMS APPLY
                    </div>
                    <span className="landing__ticket-number">28</span>
                  </div>
                </TicketCard>

                <TicketCard color="#f472b6" className="landing__ticket">
                  <div className="landing__ticket-body">
                    <p className="landing__ticket-copy">
                      For the ones who need it now. Priority handling & gaming.
                      Skip the line.
                    </p>
                    <div className="landing__ticket-main-text">
                      <h3 className="landing__ticket-title">MAIN</h3>
                      <h3 className="landing__ticket-title">CHARACTER</h3>
                      <p className="landing__ticket-price">$40 / CARD</p>
                    </div>
                    <div
                      className="landing__ticket-tag"
                      style={{ backgroundColor: "#e9d5ff", color: "#000" }}
                    >
                      SHE50CLASSY
                    </div>
                  </div>
                  <div className="landing__ticket-meta">
                    <div className="landing__ticket-meta-text">
                      NON-REFUNDABLE
                      <br /> VALID FOR ONE
                      <br /> SUBMISSION
                      <br /> TERMS APPLY
                    </div>
                    <span className="landing__ticket-number">28</span>
                  </div>
                </TicketCard>

                <TicketCard
                  color="linear-gradient(180deg, #fbbf24 0%, #f97316 100%)"
                  className="landing__ticket"
                >
                  <div className="landing__ticket-body">
                    <p className="landing__ticket-copy">
                      Instant verification. Walk in flex out. The absolute
                      fastest service.
                    </p>
                    <div className="landing__ticket-main-text">
                      <h3 className="landing__ticket-title">GOAT STATUS</h3>
                      <p className="landing__ticket-price">$80 / CARD</p>
                    </div>
                    <div
                      className="landing__ticket-tag"
                      style={{ backgroundColor: "#ffedd5", color: "#000" }}
                    >
                      24HOURFLIP
                    </div>
                  </div>
                  <div className="landing__ticket-meta">
                    <div className="landing__ticket-meta-text">
                      NON-REFUNDABLE
                      <br /> VALID FOR ONE
                      <br /> SUBMISSION
                      <br /> TERMS APPLY
                    </div>
                    <span className="landing__ticket-number">28</span>
                  </div>
                </TicketCard>
              </div>

              <div className="landing__process">
                <h2>The Process (Real-One Edition)</h2>
                <div className="landing__process-steps">
                  {["PACK 'EM.", "SHIP 'EM.", "GRADE 'EM", "FLEX 'EM"].map(
                    (label, index, array) => {
                      const descriptions = [
                        "Carefully pack your cards using protective sleeves and holders.",
                        "Ship your package securely to our grading facility.",
                        "Our experts professionally grade and authenticate your cards.",
                      ];

                      return (
                        <div key={label} style={{ display: "contents" }}>
                          <div className="landing__process-step">
                            <div
                              className={`landing__process-badge landing__process-badge--${index + 1}`}
                            >
                              {index + 1 === 4 ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                >
                                  <path
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill="none"
                                  />
                                </svg>
                              ) : (
                                <span>{index + 1}</span>
                              )}
                            </div>
                            <span>{label}</span>
                            {index < 3 && (
                              <p className="landing__process-description">
                                {descriptions[index]}
                              </p>
                            )}
                          </div>
                          {index < array.length - 1 && (
                            <div className="landing__process-arrow">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M5 12H19M19 12L12 5M19 12L12 19"
                                  stroke="black"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="landing__statement">
                <h2>
                  Join The Era. <br /> Murder Mid.
                </h2>
                <p>
                  We're not your grandpa's company. We're building the future of
                  every collection, where value is born from internet culture,
                  fueled by passion, and dedicated to the absolute W.
                </p>
              </div>
            </div>

            <div className="landing__gallery" id="hall-of-flex-section">
              <h2>The Hall of Flex</h2>
              <div className="landing__gallery-grid">
                {hallOfFlex.map((item) => (
                  <div className="landing__gallery-card" key={item.user}>
                    <img
                      src="https://mir-s3-cdn-cf.behance.net/projects/404/808cdf187184933.Y3JvcCwxNTAwLDExNzMsMCwxMDcz.jpg"
                      alt={`Flex by ${item.user}`}
                      referrerPolicy="no-referrer"
                    />
                    <div className="landing__gallery-overlay"></div>
                    <div className="landing__gallery-badge">NICE</div>
                    <div className="landing__gallery-user">@{item.user}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="landing__join">
        <div className="landing__join-header">
          <div className="landing__join-header-content">
            <img
              src="/chatgpt.png"
              alt="Join the circle community"
              className="landing__join-header-image"
              loading="lazy"
            />
            <h2 className="landing__join-title">JOIN THE CIRCLE.</h2>
          </div>
        </div>

        <div className="landing__join-inner">
          <div className="landing__join-left">
            <div className="landing__join-vertical-text">
              <span className="landing__vertical-text-line">GRADING</span>
              <span className="landing__vertical-text-line">NICE.</span>
              <span className="landing__vertical-text-line">CO</span>
            </div>

            <div className="landing__join-content">
              <div className="landing__join-pricing">
                <h3 className="landing__join-label">
                  ONE PRICE. NO UPCHARGES.
                </h3>
                <div className="landing__join-price">
                  <span className="landing__join-price-currency">$</span>
                  <span className="landing__join-price-value">15</span>
                  <span className="landing__join-price-suffix">/ CARD</span>
                </div>
                <ul className="landing__join-features">
                  <li>• 10 Day Turnaround (Or we buy you drink)</li>
                  <li>• UV Protected Sonic-Welded Slabs</li>
                  <li>• Insurance that actually pays out</li>
                </ul>
                <button className="landing__join-cta" type="button">
                  GIVE US YOUR CARDS
                </button>
              </div>
            </div>
          </div>

          <div className="landing__join-right">
            <div className="landing__join-gallery">
              <h3 className="landing__join-gallery-title">
                Grading is boring.{" "}
                <span className="landing__join-gallery-highlight">NICE</span> is
                riot.
              </h3>
              <div className="landing__join-gallery-grid">
                {collageImages.map((src, index) => (
                  <div className="landing__join-gallery-item" key={src + index}>
                    <img src={src} alt="Community" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="landing__join-footer">
          <div className="landing__join-nav">
            <a href="#" className="landing__join-nav-link">
              DASHBOARD
            </a>
            <a href="#" className="landing__join-nav-link">
              SHIP
            </a>
            <a href="#" className="landing__join-nav-link">
              FAQ
            </a>
          </div>
          <div className="landing__join-newsletter">
            <span className="landing__join-newsletter-label">
              Sell your soul to our newsletter
            </span>
            <div className="landing__join-newsletter-form">
              <input
                type="email"
                placeholder="asoul"
                className="landing__join-newsletter-input"
              />
              <button type="button" className="landing__join-newsletter-submit">
                Submit
              </button>
            </div>
          </div>
          <div className="landing__join-sparkle">✦</div>
        </div>
      </div>
    </div>
  );
};
