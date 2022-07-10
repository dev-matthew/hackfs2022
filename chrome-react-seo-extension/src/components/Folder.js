export default function Folder(props) {
    return (
        <div className="Folder">
            <div className="Tab" style={
                {left: `${props.index * 140 + 10}px`}
            }>
                {props.name}
            </div>
        </div>
    );
}