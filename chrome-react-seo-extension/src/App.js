import './App.css';
import Folder from "./components/Folder";

let folders = ["Folder1", "Folder2", "Folder3"];

export default function App() {
  return (
    <div className="App">
      {folders.map((folder, index) => {
        return (
          <Folder name={folder} index={index}/>
        );
      })}
    </div>
  );
}
