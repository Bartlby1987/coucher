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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import FilterListIcon from '@material-ui/icons/FilterList';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {getGames} from "../redux/actions";
import {connect} from 'react-redux';
import './games.css';
import Loader from "../Loader";

const headCells = [
    {id: 'name', numeric: false, disablePadding: true, label: 'Game name  '},
    {id: 'genre', numeric: true, disablePadding: false, label: 'Genre'},
    {id: 'releaseDate', numeric: true, disablePadding: false, label: 'ReleaseDate '},
    {id: 'splitScreen', numeric: true, disablePadding: false, label: 'SplitScreen '},
    {id: 'players', numeric: true, disablePadding: false, label: 'Players '},
    {id: 'criticScore', numeric: true, disablePadding: false, label: 'CriticScore '},
    {id: 'userScore', numeric: true, disablePadding: false, label: 'UserScore '},
];

class EnhancedTableHead extends React.Component {
    render() {
        const {order, orderBy, onRequestSort} = this.props;
        const createSortHandler = (property) => (event) => {
            onRequestSort(event, property);
        };
        return (
            <TableHead>
                <TableRow>
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

class EnhancedTable extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        this.props.getGames(this.props.param);
    }

    updateGamesRows(param) {
        this.props.getGames(param);
        return this.props.games
    }

    render() {

        let param = {
            order: this.props.param.order,
            orderBy: this.props.param.orderBy,
            selected: this.props.param.selected,
            page: this.props.param.page,
            dense: this.props.param.dense,
            rowsPerPage: this.props.param.rowsPerPage
        }

        let {order, orderBy, selected, page, dense, rowsPerPage} = this.props.param;

        const handleRequestSort = (event, property) => {
            let newOrder;
            if (order === 'asc') {
                newOrder = 'desc'
            } else {
                newOrder = 'asc'
            }
            let newParam = {...param, orderBy: property, order: newOrder}
            this.updateGamesRows(newParam);
        };

        const handleSelectAllClick = (event) => {
            if (event.target.checked) {
                const newSelecteds = this.props.games.map((n) => n.name);
                let newParam = {...param, selected: newSelecteds}
                this.updateGamesRows(newParam);
            }
        };

        const handleChangePage = (event, newPage) => {
            let newParam = {...param, page: newPage}
            this.updateGamesRows(newParam);
        };

        const handleChangeRowsPerPage = (event) => {
            let newParam = {...param, rowsPerPage: parseInt(event.target.value, 10), page: 0}
            this.updateGamesRows(newParam);
        };

        const handleChangeDense = (event) => {
            let newParam = {...param, dense: event.target.checked}
            this.updateGamesRows(newParam);
        };

        const isSelected = (name) => selected.indexOf(name) !== -1;
        const emptyRows = rowsPerPage - this.props.games.length;
        let gamesInfo;
        let tableBody =
            <TableBody>
                {
                    this.props.games
                        .map((row, index) => {
                            const labelId = `enhanced-table-checkbox-${index}`;
                            return (
                                <TableRow
                                    hover

                                    tabIndex={-1}
                                    key={row.name}
                                >
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
        if (this.props.loading) {
            gamesInfo = <Loader/>
        } else {
            gamesInfo = tableBody;
        }

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
                                {gamesInfo}

                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={500}
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
    games: state.games.games,
    param: state.games.paramLoad,
    loading: state.app.loading
});

export default connect(mapStateToProps, mapDispatchToProps)(EnhancedTable);