import React from 'react';
import axios from 'axios';

import Seo from '../components/Seo';
import Layout from '../components/layout';
import Thanks from '../components/Thanks';

class SubscribePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      submitted: false
    };
  }

  changeEmail = (e) => {
    this.setState({
      email: e.target.value
    });
  };

  submitEmail = (e) => {
    e.preventDefault();
    const { email } = this.state;
    console.log(process.env.EMAILOCTOPUS_KEY);
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      },
      crossdomain: true
    };
    axios
      .post(
        'https://emailoctopus.com/api/1.5/lists/c26e1c25-0833-11e9-a3c9-06b79b628af2/contacts',
        {
          api_key: process.env.EMAILOCTOPUS_KEY,
          email
        },
        axiosConfig
      )
      .then((response) => {
        console.log(response);
        this.setState({
          email: ''
        }).catch((error) => {
          console.error(error);
        });
      });
    this.setState({
      submitted: true
    });
  };

  render() {
    const { submitted } = this.state;
    return (
      <Layout>
        <Seo data={{ frontmatter: { title: 'Subscribe' } }} />
        <div className="align-top text-center">
          <h1 className="inline-block pt-3 pb-3">Subscribe</h1>
        </div>
        <div className="align-top">
          <div className="leading-loose py-3">
            Ocassionally, I send an email to my list. I talk about all
            tech-related, making stuff, tips and tricks for developers, and
            interesting events.
            {submitted ? (
              <Thanks />
            ) : (
              <form method="POST" className="" onSubmit={this.submitEmail}>
                <input
                  className="mr-6 shadow appearence-none border rounded py-3 px-3 my-2 leading-tight focus:outline-none focus:shadow-outline"
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="me@email.com"
                  onChange={this.changeEmail}
                />
                <input
                  type="submit"
                  value="Subscribe Now!"
                  className="bg-black hover:bg-grey-darker text-yellow-light font-bold py-3 px-3 rounded focus:outline-none focus:shadow-outline"
                />
              </form>
            )}
          </div>
        </div>
      </Layout>
    );
  }
}

export default SubscribePage;
