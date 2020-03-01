import React, { Component } from "react";
import { ToastContainer } from "react-toastify";
import GitHubButton from "react-github-btn";
import http from "./services/httpService";
import DonationModal from "./components/donationModal";
import Loader from "react-loader-spinner";
import FaucetForm from "./components/faucetForm";
import Stats from "./components/stats";
import SentryBoundary from "./components/sentry";
import * as Sentry from "@sentry/browser";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

class App extends Component {
  state = {
    loading: false,
    modalShow: false,
    gCaptcha: "",
    success: "",
    statsData: {}
  };

  async componentDidMount() {
    const { data } = await http.get("backend/serveStats.php");
    this.setState({ statsData: data });
    Sentry.init({
      dsn: "https://6de3fe5c0cec4d65b27e419323bc6bdb@sentry.io/1457672"
    });
  }

  showModal = () => {
    this.setState({
      modalShow: true
    });
  };

  hideModal = () => {
    this.setState({
      modalShow: false
    });
  };

  handleCaptcha = gCaptcha => {
    this.setState({ gCaptcha });
  };

  doSubmit = async data => {
    const { gCaptcha } = this.state;
    this.setState({ loading: true });

    let success = false;
    let message = "";
    let txID = "";

    if (data && gCaptcha) {
      const response = await http.post("backend/backend.php", {
        "g-recaptcha-response": gCaptcha,
        address: data
      });

      if (response.data.result) {
        success = true;
        txID = response.data.txid;
      } else if (response.data.message) {
        message = response.data.message;
        if (message === "Unable to connect to http://localhost:9904") {
          message = "Unable to connect to peercoind. Please retry later.";
        }
      }
    } else {
      message = "Please prove you're not a robot.";
    }

    this.setState({
      loading: false,
      success,
      txID,
      message,
      address: data,
      gCaptcha: ""
    });
  };

  render() {
    const {
      loading,
      modalShow,
      success,
      address,
      message,
      txID,
      statsData
    } = this.state;
    return (
      <React.Fragment>
        <SentryBoundary>
          <ToastContainer />
          <div
            style={{
              position: "absolute",
              width: "100%",
              minWidht: "100vw",
              minHeight: "100vh"
            }}
          >
            {loading && (
              <div className="loader">
                <Loader
                  type="RevolvingDot"
                  color="#3cb054"
                  height="100"
                  width="100"
                />
              </div>
            )}
            <header>
              <div className="navbar_ppc navbar-dark shadow-sm">
                <div className="container d-flex justify-content-between">
                  <img
                    className="logo"
                    style={{ maxWidth: "100vw", margin: 10 }}
                    src="https://peercoinexplorer.net/peercoin-horizontal-greenleaf-whitetext-transparent.svg"
                    alt="Peercoin Logo"
                  />
                </div>
              </div>
            </header>
            <main role="main">
              <section className="jumbotron text-center">
                <div className="container">
                  <DonationModal
                    modalShow={modalShow}
                    hideModal={this.hideModal}
                  />
                  <h1 className="jumbotron-heading">Peercoin Testnet Faucet</h1>
                  <hr />
                  <div className="row">
                    <div className="col-md-6 faucetForm">
                      <FaucetForm
                        raiseSubmit={this.doSubmit}
                        raiseCaptcha={this.handleCaptcha}
                        success={success}
                      />
                      {success === true && (
                        <div
                          className="alert alert-success"
                          role="alert"
                          style={{ marginTop: "10px", wordWrap: "break-word" }}
                        >
                          <b>
                            100 tPPC have been paid out to{" "}
                            <span className="donate_addr">{address}</span>
                            <br />
                            Transaction ID:
                            <span className="donate_addr">{txID}</span>
                          </b>
                        </div>
                      )}
                      {success === false && (
                        <div
                          className="alert alert-danger"
                          role="alert"
                          style={{ marginTop: "10px" }}
                        >
                          <b>Something went wrong. Please try again. </b>
                          <p>{message}</p>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 faucetForm">
                      {statsData.balance && <Stats statsData={statsData} />}
                    </div>
                  </div>

                  <div
                    className="alert alert-secondary"
                    style={{ margin: "10px auto" }}
                    role="alert"
                  >
                    Please send unused coins back to{" "}
                    <span className="donate_addr">
                      n4pJDAqsagWbouT7G7xRH8548s9pZpQwtG
                    </span>
                  </div>
                </div>
                <GitHubButton
                  href="https://github.com/bananenwilly/peercoinexplorer.net-faucet/issues"
                  data-icon="octicon-issue-opened"
                  data-size="large"
                  data-show-count="true"
                  aria-label="Issue bananenwilly/peercoinexplorer.net-faucet on GitHub"
                >
                  Issue
                </GitHubButton>
              </section>
            </main>
            <footer className="footer navbar_ppc">
              <div className="container">
                <p className="donate_addr text-light">
                  If you're enjoying this service, please consider donating to
                  <button
                    type="button"
                    onClick={() => this.showModal()}
                    className="btn btn-secondary donate_addr"
                  >
                    PPXMXETHJE3E8k6s8vmpDC18b7y5eKAudS
                  </button>
                </p>
              </div>
            </footer>
          </div>
        </SentryBoundary>
      </React.Fragment>
    );
  }
}

export default App;
