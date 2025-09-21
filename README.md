# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Homepage of our website
<img width="1897" height="902" alt="{298C32D2-948F-4577-A4E9-C83FBE114861}" src="https://github.com/user-attachments/assets/cafc328f-f0cb-4c82-a482-49c720c183c0" />

# Login Page
<img width="1906" height="901" alt="{AC711DA7-CDD9-498C-8959-CB36A65A9EBF}" src="https://github.com/user-attachments/assets/5a90a2e2-620d-41e0-9d50-1672b7404151" />
<img width="1901" height="917" alt="{95EE0E92-0C81-48D7-9A78-EB3CAC1C03B3}" src="https://github.com/user-attachments/assets/5ad4c6ec-47b2-45da-b4ed-14bf39c90a18" />

# Authentication using Firebase

Users are able to signup, if they're first time to the website and a entry will be created for the user who signed up with an user id and database also will be created
And for the next time if a user logs in the user id and gmail id will be checked from the database and will be authenticated
<img width="1920" height="899" alt="{04A8B249-3241-42E3-8B87-56390DF5D65F}" src="https://github.com/user-attachments/assets/b374d786-3282-4e73-82c3-47b1a2f19274" />
<img width="1243" height="936" alt="{77440CC4-9285-40A1-926A-D8F1EE783AAE}" src="https://github.com/user-attachments/assets/d19f3aae-dbd8-4762-8207-5f74fe7182c7" />

# Document Upload
Coming to Document upload part, as you can see below you can upload a document and from the 4 types select any one, but remember the file you've uploaded and the type
you're selecting must be the same.
<img width="1898" height="909" alt="{AD2C0355-2ED8-4485-A120-C4A5CA7DC289}" src="https://github.com/user-attachments/assets/984dc026-02ef-4cec-858c-c53632eed3ca" />

A file upload status will be shown in order to show the confirmation of file uploaded from frontend is stored in firebase storage.
<img width="1901" height="913" alt="{9DB1B436-5043-41CF-AA0E-850C80EE2288}" src="https://github.com/user-attachments/assets/ed78acf9-1bf2-4610-8797-e19b176bdf68" />
After this enter the details asked which will be compared with document from data using Google generative AI, which uses gemini 2.5 flash model.

In firebase storage the file will be stored here uploads ->Userid -> file.pdf
<img width="1920" height="908" alt="{B381F607-D60D-4607-9611-E195A619AB04}" src="https://github.com/user-attachments/assets/d2f92ae2-4138-49ba-8dc8-c51585e386f4" />

# Result Analysis Page
Image previews of the file uploaded will be shown here. This is done using pdfjs-dist module, which is used to convert pdf to images. This is done in order to cross
check the file the user uploaded.
<img width="1914" height="711" alt="{E021E2CC-4397-4DB8-9302-4CB282086B71}" src="https://github.com/user-attachments/assets/fc59dc71-9747-4c3c-9f5b-05a2b202b4ca" />

A pagewise summary will be provided for a simlpler understanding of the document uploaded
<img width="1920" height="651" alt="{0C35AC0D-44F6-4796-B243-F59428BD359F}" src="https://github.com/user-attachments/assets/4cf06598-3d76-4e1c-a2dc-4f063d11e1dc" />

This result table will be shown, which is an User input Vs. Data from document which will be compared using Google generative AI, which uses gemini 2.5 flash model
and shows a match or mismatch for the details.
<img width="1920" height="916" alt="{22632BF1-288B-4053-A9CA-25E3E5870A87}" src="https://github.com/user-attachments/assets/2b9e901d-06bc-43fa-9ffa-741f9266eb5b" />

# Profile Page
In profile page a user can see the files uploaded, and the user can delete it if not needed or reverify the same file for future uses.
<img width="1920" height="903" alt="{19BCAD20-A784-4BA2-A0B2-44133FF06FED}" src="https://github.com/user-attachments/assets/199d6917-465c-42e4-95bd-166011fc0be1" />

# Chatbot
This chatbot is made using Voiceflow, which answers for the questions regarding doubts about legal documents and other legal doubts, it is trained with required data
to produce the outptuts accordingly
<img width="482" height="769" alt="{6907207F-5F17-4975-B312-DA0E95F4AFE2}" src="https://github.com/user-attachments/assets/2ff731ce-4f33-441d-b379-654128660008" />





