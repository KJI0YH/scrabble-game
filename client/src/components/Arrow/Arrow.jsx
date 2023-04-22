import arrow from './right-arrow.png';
import './Arrow.css';

function Arrow(props) {
    const { color, horizontal } = props;
    return (
        <div className='arrow-container' style={{ backgroundColor: color }}>
            <img
                src={arrow}
                alt="arrow"
                style={{
                    transform: horizontal ? 'none' : 'rotate(90deg)',
                }} />
        </div>
    )
}

export default Arrow;