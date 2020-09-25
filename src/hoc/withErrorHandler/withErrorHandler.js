import React, {Component} from 'react';
import Modal from '../../components/UI/Modal/Modal';

const withErrorHandler = (WrappedComponent, axios) => {
    return class extends Component {

        state = {
            error: null,
        }

        errorConfirmedHandler = () => {
            this.setState({error:null});
        }

        componentWillMount(){
            this.reqInter = axios.interceptors.request.use(req => {
                this.setState({error:null});
                return req;
            });
            this.resInter =  axios.interceptors.response.use(res => res, error => {
                this.setState({error: error});
            });
        }

        componentWillUnmount(){
            axios.interceptors.response.eject(this.resInter);
            axios.interceptors.request.eject(this.reqInter);
        }

        render(){
            return(
                <React.Fragment>
                    <Modal show={this.state.error} modalClosed={this.errorConfirmedHandler}>
                        {this.state.error? this.state.error.message : null}
                    </Modal>
                    <WrappedComponent {...this.props}/>
                </React.Fragment>
            ); 
        }
    }
}

export default withErrorHandler;