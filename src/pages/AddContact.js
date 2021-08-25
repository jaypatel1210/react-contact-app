import React, { useState, useContext, useEffect } from 'react';
import firebase from 'firebase/app';

import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Row,
  Col,
} from 'reactstrap';

// to compress image before uploading to the server
import { readAndCompressImage } from 'browser-image-resizer';

// configs for image resizing
import { imageConfig } from '../utils/config';

import { v4 } from 'uuid';

// context stuffs
import { ContactContext } from '../context/Context';
import { CONTACT_TO_UPDATE } from '../context/action.types';

import { useHistory } from 'react-router-dom';

import { toast } from 'react-toastify';
import ManImg from '../assets/man.png';

const AddContact = () => {
  // destructuring state and dispatch from context state
  const { state, dispatch } = useContext(ContactContext);

  const { contactToUpdate, contactToUpdateKey } = state;

  // history hooks from react router dom to send to different page
  const history = useHistory();

  // simple state of all component
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [star, setStar] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [createdDate, setCreatedDate] = useState(null);

  // when their is the contact to update in the Context state
  // then setting state with the value of the contact
  // will changes only when the contact to update changes
  useEffect(() => {
    if (contactToUpdate) {
      setName(contactToUpdate.name);
      setEmail(contactToUpdate.email);
      setPhoneNumber(contactToUpdate.phoneNumber);
      setAddress(contactToUpdate.address);
      setStar(contactToUpdate.star);
      contactToUpdate.picture
        ? setDownloadUrl(contactToUpdate.picture)
        : setDownloadUrl('');
      setCreatedDate(contactToUpdate.created);
      // also setting is update to true to make the update action instead the addContact action
      setIsUpdate(true);
    }
  }, [contactToUpdate]);

  // To upload image to firebase and then set the the image link in the state of the app
  const imagePicker = async e => {
    try {
      const file = e.target.files[0];

      var metaData = {
        contentType: file.type,
      };

      let reziedImage = await readAndCompressImage(file, imageConfig);

      const storageRef = await firebase.storage().ref();
      var uploadTask = storageRef
        .child(`images/${file.name}`)
        .put(reziedImage, metaData);

      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        snapshot => {
          setIsUploading(true);
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED:
              setIsUploading(false);
              console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
            default:
              break;
          }

          if (progress === 100) {
            setIsUploading(false);
            toast('File Uploaded', { type: 'success' });
          }
        },
        err => {
          toast('Something Went Wrong', { type: 'warning' });
        },
        () => {
          uploadTask.snapshot.ref
            .getDownloadURL()
            .then(downloadURL => {
              setDownloadUrl(downloadURL);
            })
            .catch(() => {
              toast('Something Went Wrong', { type: 'warning' });
            });
        }
      );
    } catch (error) {
      console.log(error);
      toast('Something Went Wrong', { type: 'warning' });
    }
  };

  // setting contact to firebase DB
  const addContact = async () => {
    try {
      const today = new Date();

      if (!name) return toast('Enter Name', { type: 'error' });
      if (!email) return toast('Enter Email', { type: 'error' });
      if (!phoneNumber) return toast('Enter Phone Number', { type: 'error' });

      firebase
        .database()
        .ref(`contacts/${v4()}`)
        .set({
          name,
          email,
          phoneNumber,
          address,
          picture: downloadUrl,
          star,
          created: `${today.getDate()}/${today.getMonth()}/${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}`,
        });
      history.push('/');
    } catch (error) {
      console.log(error);
      toast('Something Went Wrong', { type: 'warning' });
    }
  };

  // to handle update the contact when there is contact in state and the user had came from clicking the contact update icon
  const updateContact = async () => {
    try {
      if (!name) return toast('Enter Name', { type: 'error' });
      if (!email) return toast('Enter Email', { type: 'error' });
      if (!phoneNumber) return toast('Enter Phone Number', { type: 'error' });
      firebase.database().ref(`/contacts/${contactToUpdateKey}`).set({
        name,
        email,
        phoneNumber,
        address,
        picture: downloadUrl,
        star,
        created: createdDate,
      });
      toast('Success', { type: 'success' });
      history.push('/');
    } catch (error) {
      console.log(error);
      toast('Something Went Wrong', { type: 'warning' });
    }
  };

  // firing when the user click on submit button or the form has been submitted
  const handleSubmit = e => {
    e.preventDefault();
    isUpdate ? updateContact() : addContact();
    // toast('Success', { type: 'success' });
    // isUpdate wll be true when the user came to update the contact
    // when their is contact then updating and when no contact to update then adding contact

    // to handle the bug when the user visit again to add contact directly by visiting the link
    dispatch({
      type: CONTACT_TO_UPDATE,
      payload: null,
      key: null,
    });
  };

  // return the spinner when the image has been added in the storage
  // showing the update / add contact based on the  state
  return (
    <Container fluid className="mt-5">
      <Row>
        <Col md="6" className="offset-md-3 p-2">
          <Form onSubmit={handleSubmit}>
            <div className="text-center">
              {isUploading ? (
                <Spinner type="grow" color="primary" />
              ) : (
                <div>
                  <label htmlFor="imagepicker" className="">
                    <img
                      src={downloadUrl ? downloadUrl : ManImg}
                      alt=""
                      className="profile"
                    />
                  </label>
                  <input
                    type="file"
                    name="image"
                    id="imagepicker"
                    accept="image/*"
                    multiple={false}
                    onChange={e => imagePicker(e)}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <FormGroup>
              <Input
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="number"
                name="number"
                id="phonenumber"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="phone number"
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="textarea"
                name="area"
                id="area"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="address"
              />
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  onChange={() => {
                    setStar(!star);
                  }}
                  checked={star}
                />{' '}
                <span className="text-right">Mark as Star</span>
              </Label>
            </FormGroup>
            <Button
              type="submit"
              color="primary"
              block
              className="text-uppercase"
            >
              {isUpdate ? 'Update Contact' : 'Add Contact'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddContact;
