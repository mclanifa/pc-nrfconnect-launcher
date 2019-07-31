/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';

import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';

import { clipboard } from 'electron';
import moment from 'moment';

import ConfirmRemoveSourceDialog from '../containers/ConfirmRemoveSourceDialog';
import InputLineDialog from './InputLineDialog';

const CopyToClipboard = ({ text }) => (
    <Button
        size="sm"
        variant="light"
        title="Copy to clipboard"
        onClick={() => clipboard.writeText(text)}
    >
        <span className="mdi mdi-content-copy" />
    </Button>
);

CopyToClipboard.propTypes = {
    text: PropTypes.string.isRequired,
};

function cancel(event) {
    event.preventDefault();
    const { dataTransfer } = event;
    dataTransfer.dropEffect = 'copy';
    return false;
}

class SettingsView extends React.Component {
    constructor() {
        super();
        this.onCheckUpdatesAtStartupChanged = this.onCheckUpdatesAtStartupChanged.bind(this);
        this.onTriggerUpdateCheckClicked = this.onTriggerUpdateCheckClicked.bind(this);
    }

    componentDidMount() {
        const { onMount } = this.props;
        onMount();
    }

    onCheckUpdatesAtStartupChanged(event) {
        const { onCheckUpdatesAtStartupChanged } = this.props;
        onCheckUpdatesAtStartupChanged(event.target.checked);
    }

    onTriggerUpdateCheckClicked() {
        const { onTriggerUpdateCheck } = this.props;
        onTriggerUpdateCheck();
    }

    onDropUrl(event) {
        const { addSource } = this.props;
        event.preventDefault();
        const url = event.dataTransfer.getData('Text');
        addSource(url);
    }

    render() {
        const {
            shouldCheckForUpdatesAtStartup,
            isCheckingForUpdates,
            lastUpdateCheckDate,
            isUpdateCheckCompleteDialogVisible,
            onHideUpdateCheckCompleteDialog,
            isAppUpdateAvailable,
            sources,
            addSource,
            isAddSourceDialogVisible,
            onShowAddSourceDialog,
            onHideAddSourceDialog,
            onShowRemoveSourceDialog,
        } = this.props;

        const sourcesJS = sources.toJS();

        return (
            <>
                <Card body>
                    <Row>
                        <Col><Card.Title>Updates</Card.Title></Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-primary"
                                onClick={this.onTriggerUpdateCheckClicked}
                                disabled={isCheckingForUpdates}
                            >
                                { isCheckingForUpdates ? 'Checking...' : 'Check for updates' }
                            </Button>
                        </Col>
                    </Row>

                    <p className="small text-muted">
                        {
                            lastUpdateCheckDate
                                && <>Last update check performed: { moment(lastUpdateCheckDate).format('YYYY-MM-DD HH:mm:ss') }</>
                        }
                    </p>
                    <Form.Check
                        custom
                        id="checkForUpdates"
                        label="Check for updates at startup"
                        checked={shouldCheckForUpdatesAtStartup}
                        onChange={this.onCheckUpdatesAtStartupChanged}
                    />
                    {
                        isUpdateCheckCompleteDialogVisible && (
                            <Modal show onHide={onHideUpdateCheckCompleteDialog}>
                                <Modal.Header>
                                    <Modal.Title>Update check completed</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    {
                                        isAppUpdateAvailable
                                            ? (
                                                <>
                                                    One or more updates are
                                                    available. Go to the
                                                    Add/remove apps screen to
                                                    upgrade.
                                                </>
                                            )
                                            : <>All apps are up to date.</>
                                    }
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button
                                        variant="outline-primary"
                                        onClick={onHideUpdateCheckCompleteDialog}
                                    >
                                    Got it
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        )
                    }
                </Card>
                <Card
                    body
                    onDrop={event => this.onDropUrl(event)}
                    onDragOver={cancel}
                    onDragEnter={cancel}
                    id="app-sources"
                >
                    <Row>
                        <Col><Card.Title>App sources</Card.Title></Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-primary"
                                onClick={onShowAddSourceDialog}
                            >
                                Add source
                            </Button>
                        </Col>
                    </Row>
                    {
                        Object.keys(sourcesJS)
                            .filter(name => name !== 'official')
                            .map(name => (
                                <Row key={name}>
                                    <Col className="item-name">{name}</Col>
                                    <Col xs="auto">
                                        <ButtonToolbar>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => clipboard.writeText(sourcesJS[name])}
                                                title="Copy to clipboard"
                                            >
                                                Copy
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => onShowRemoveSourceDialog(name)}
                                                title="Remove source and associated apps"
                                            >
                                                Remove
                                            </Button>
                                        </ButtonToolbar>
                                    </Col>
                                </Row>
                            ))
                    }
                    {
                        isAddSourceDialogVisible && (
                            <InputLineDialog
                                isVisible
                                title="Add source"
                                placeholder="https://..."
                                subtext="The source file must be in .json format"
                                onOk={url => { addSource(url); onHideAddSourceDialog(); }}
                                onCancel={onHideAddSourceDialog}
                            />
                        )
                    }
                    <ConfirmRemoveSourceDialog />
                </Card>
            </>
        );
    }
}

SettingsView.propTypes = {
    onMount: PropTypes.func,
    shouldCheckForUpdatesAtStartup: PropTypes.bool.isRequired,
    isCheckingForUpdates: PropTypes.bool.isRequired,
    onCheckUpdatesAtStartupChanged: PropTypes.func.isRequired,
    onTriggerUpdateCheck: PropTypes.func.isRequired,
    lastUpdateCheckDate: PropTypes.instanceOf(Date),
    isUpdateCheckCompleteDialogVisible: PropTypes.bool,
    onHideUpdateCheckCompleteDialog: PropTypes.func.isRequired,
    isAppUpdateAvailable: PropTypes.bool,
    sources: PropTypes.shape({}).isRequired,
    addSource: PropTypes.func.isRequired,
    onShowRemoveSourceDialog: PropTypes.func.isRequired,
    isAddSourceDialogVisible: PropTypes.bool,
    onShowAddSourceDialog: PropTypes.func.isRequired,
    onHideAddSourceDialog: PropTypes.func.isRequired,
};

SettingsView.defaultProps = {
    onMount: () => {},
    lastUpdateCheckDate: null,
    isUpdateCheckCompleteDialogVisible: false,
    isAppUpdateAvailable: false,
    isAddSourceDialogVisible: false,
};

export default SettingsView;
