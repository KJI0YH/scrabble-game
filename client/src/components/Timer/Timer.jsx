
function Timer(props) {
    const { caption, seconds } = props;
    const mm = seconds / 60;
    const ss = seconds % 60;

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <div className="timer">
            {caption}{formatTime(seconds)}
        </div>
    )
}

export default Timer;