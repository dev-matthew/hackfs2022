# Noir - HackFS 2022

![logo192](https://user-images.githubusercontent.com/80741503/180339623-910f0a20-7e8a-470d-9f18-87b681e344e1.png)

## About

Noir is a Chrome extension that enables easy and secure chatting across websites. Noir is also a social network in the sense that users can mint NFTs for websites they choose, providing easier and more personalized contact between anonymous Ethereum accounts.

Noir can be thought of as a web3-oriented messaging app, taking some inspiration from web2 community-based platforms such as Discord and Reddit. Within the web3 ecosystem, there are already many existing communities and products. However, some of these products' users have never diretly interacted with each other. Noir's goal is to enable communication and discovery of other users in each and every one of these environments, enabling better communities. As a Chrome extension, Noir is accessible in every corner of the internet. Noir can thus integrate and build on top of projects' websites. For example, users can open multiple direct, private chats with users that are unique to the website they are currently on. Users can also view communities that other users choose to display, allowing for the discovery of fellow community members.

## Technology

Noir is a Chrome extension built using NodeJS and React. Critical to Noir's functionality are the following sponsors:
- XMTP
  - XMTP is used as the messaging protocol powering Noir. When a user first installs the extension, they are logged onto the XMTP network via an Ethers wallet. From then on, messages are signed, sent, and retrieved using XMTP.

- IPFS & Filecoin (web3.storage)
  - The API of web3.storage is used to upload and host images. The NFTs are made by overlaying the website's favicon on top of Noir's icon, which is then hosted on IPFS.

- NFTPort
  - NFTPort's API is used to easily mint NFTs for websites and users. These NFTs represent which websites/communities the user is a part of. They are hosted on Polygon and contain a reference to the IPFS CID.

- Covalent
  - Covalent's API is used to lookup users and view their displayed communities/websites. The API gets a list a user's Noir NFTs that they own and displays them in a popup.

- Valist
  - The files/build for Noir are hosted on Valist.

## Future Additions

- [ ] Background script to send notifications on new conversation/message
