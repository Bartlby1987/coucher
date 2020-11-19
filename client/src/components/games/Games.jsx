import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import FilterListIcon from '@material-ui/icons/FilterList';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {getGames} from "../redux/actions";
import {connect} from 'react-redux';
import './games.css';

let rows = [{
    "name": "1917 The Alien Invasion DX",
    "genre": "Shmup",
    "releaseDate": "06/14/2018",
    "splitScreen": false,
    "players": 2,
    "criticScore": "NA",
    "userScore": "NA"
}, {
    "name": "20XX",
    "genre": "Platform Shooter",
    "releaseDate": "07/10/2018",
    "splitScreen": false,
    "players": 2,
    "criticScore": 77,
    "userScore": 7.7
}];

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    { id: 'name', numeric: false, disablePadding: true, label: 'Game name  ' },
    { id: 'genre', numeric: true, disablePadding: false, label: 'Genre' },
    { id: 'releaseDate', numeric: true, disablePadding: false, label: 'ReleaseDate ' },
    { id: 'splitScreen', numeric: true, disablePadding: false, label: 'SplitScreen ' },
    { id: 'players', numeric: true, disablePadding: false, label: 'Players ' },
    { id: 'criticScore', numeric: true, disablePadding: false, label: 'CriticScore ' },
    { id: 'userScore', numeric: true, disablePadding: false, label: 'UserScore ' },
];

class EnhancedTableHead extends React.Component {
    render() {
        const {onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort} = this.props;
        const createSortHandler = (property) => (event) => {
            onRequestSort(event, property);
        };
        return (
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox">
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{'aria-label': 'select all desserts'}}
                        />
                    </TableCell>
                    {headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            align={headCell.numeric ? 'right' : 'left'}
                            padding={headCell.disablePadding ? 'none' : 'default'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <span className='visuallyHidden'>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
                                ) : null}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        );
    }
}

EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1),
    },
    highlight:
        theme.palette.type === 'light',
    title: {
        flex: '1 1 100%',
    },
}));

function EnhancedTableToolbar(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    let filterMenu = <div>
        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
            <FilterListIcon/>
        </Button>
        <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>My account</MenuItem>
            <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
    </div>;
    const classes = useToolbarStyles();
    const {numSelected} = props;
    return (
        <Toolbar
            className={clsx(classes.root, {
                [classes.highlight]: numSelected > 0,
            })}
        >
            {numSelected > 0 ? (
                <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
                    Nutrition
                </Typography>
            )}
            {
                (
                    <div>
                        {filterMenu}
                    </div>
                )
            }
        </Toolbar>
    );
}

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};
//
// const useStyles = makeStyles((theme) => ({
//     root: {
//         width: '100%',
//     },
//     paper: {
//         width: '100%',
//         marginBottom: theme.spacing(2),
//     },
//     table: {
//         minWidth: 750,
//     },
//     visuallyHidden: {
//         border: 0,
//         clip: 'rect(0 0 0 0)',
//         height: 1,
//         margin: -1,
//         overflow: 'hidden',
//         padding: 0,
//         position: 'absolute',
//         top: 20,
//         width: 1,
//     },
// }));

class EnhancedTable extends React.Component {

    constructor(props, context) {
        super(props, context);


        this.state = {
            order: 'asc',
            orderBy: 'calories',
            selected: [],
            page: 0,
            dense: false,
            rowsPerPage: 5
        }
    }

    componentDidMount() {
        this.props.getGames();
    }

    useStyles() {
        return (makeStyles((theme) => ({
            root: {
                width: '100%',
            },
            paper: {
                width: '100%',
                marginBottom: theme.spacing(2),
            },
            table: {
                minWidth: 750,
            },
            visuallyHidden: {
                border: 0,
                clip: 'rect(0 0 0 0)',
                height: 1,
                margin: -1,
                overflow: 'hidden',
                padding: 0,
                position: 'absolute',
                top: 20,
                width: 1,
            },
        })))()
    };

    render() {
        const handleRequestSort = (event, property) => {
            const isAsc = this.state.orderBy === property && this.state.order === 'asc';
            this.setState({
                order: isAsc ? 'desc' : 'asc',
                orderBy: property
            });
        };

        const handleSelectAllClick = (event) => {
            if (event.target.checked) {
                const newSelecteds = this.props.games.map((n) => n.name);
                this.setState({selected: newSelecteds});
                return;
            }
            this.setState({selected: []});
        };

        const handleClick = (event, name) => {
            const selectedIndex = selected.indexOf(name);
            let newSelected = [];

            if (selectedIndex === -1) {
                newSelected = newSelected.concat(selected, name);
            } else if (selectedIndex === 0) {
                newSelected = newSelected.concat(selected.slice(1));
            } else if (selectedIndex === selected.length - 1) {
                newSelected = newSelected.concat(selected.slice(0, -1));
            } else if (selectedIndex > 0) {
                newSelected = newSelected.concat(
                    selected.slice(0, selectedIndex),
                    selected.slice(selectedIndex + 1),
                );
            }

            this.setState({selected: newSelected});
        };

        const handleChangePage = (event, newPage) => {
            this.setState({page: newPage});
        };

        const handleChangeRowsPerPage = (event) => {
            this.setState({rowsPerPage: parseInt(event.target.value, 10), page: 0});
        };

        const handleChangeDense = (event) => {
            this.setState({dense: event.target.checked});
        };

        const isSelected = (name) => selected.indexOf(name) !== -1;

        // let rowsPerPage = this.state.rowsPerPage;
        // let page = this.state.page;
        let {order, orderBy, selected, page, dense, rowsPerPage} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.props.games.length - page * rowsPerPage);

        return (
            <div className='root'>
                <Paper className='paper'>
                    <EnhancedTableToolbar numSelected={selected.length}/>
                    <TableContainer>
                        <Table
                            className='table'
                            aria-labelledby="tableTitle"
                            size={dense ? 'small' : 'medium'}
                            aria-label="enhanced table"
                        >
                            <EnhancedTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={this.props.games.length}
                            />
                            <TableBody>
                                {stableSort(this.props.games, getComparator(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => {
                                        const isItemSelected = isSelected(row.name);
                                        const labelId = `enhanced-table-checkbox-${index}`;

                                        return (
                                            <TableRow
                                                hover
                                                onClick={(event) => handleClick(event, row.name)}
                                                role="checkbox"
                                                aria-checked={isItemSelected}
                                                tabIndex={-1}
                                                key={row.name}
                                                selected={isItemSelected}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={isItemSelected}
                                                        inputProps={{'aria-labelledby': labelId}}
                                                    />
                                                </TableCell>
                                                <TableCell component="th" id={labelId} scope="row" padding="none">
                                                    {row.name}
                                                </TableCell>
                                                <TableCell align="right">{row.genre}</TableCell>
                                                <TableCell align="right">{row.releaseDate}</TableCell>
                                                <TableCell align="right">{row.splitScreen}</TableCell>
                                                <TableCell align="right">{row.players}</TableCell>
                                                <TableCell align="right">{row.criticScore}</TableCell>
                                                <TableCell align="right">{row.userScore}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <TableRow style={{height: (dense ? 33 : 53) * emptyRows}}>
                                        <TableCell colSpan={6}/>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component="div"
                        count={this.props.games.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                </Paper>
                <FormControlLabel
                    control={<Switch checked={dense} onChange={handleChangeDense}/>}
                    label="Dense padding"
                />
            </div>
        );
    }
}

const mapDispatchToProps = {
    getGames
};
const mapStateToProps = state => ({
    games: state.games.games
});

export default connect(mapStateToProps, mapDispatchToProps)(EnhancedTable);