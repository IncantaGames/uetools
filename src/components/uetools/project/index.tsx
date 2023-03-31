// draw a button with a text
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as path from "path";
import VSCodeWrapper from "../../../types/VSCodeApi";
import { UnrealEngineProject } from "../../../types";
import styled from "styled-components";
import { Layout } from "../../styles/Layout";

// Base panel with components on horizontal layout
// to the left the thumbnail with fixed size, to the right the project description
// if to narrow, the thumbnail goes to the top and the project description goes to the bottom
const DescriptionPanel = styled.div`
  position: relative;
  padding: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: stretch;
  align-content: stretch;
  overflow: hidden;
  border-radius: 5px;
`;

// Project details Panel with translucent glass effect background
const ProjectDetailsPanel = styled.div`
  flex-grow: 2;
  padding: 10px;
  border-radius: 5px;
  background-color: #000000d1;
`;

// Splash background image and fit to the div
const BackgroundImage = styled.div<{ img: string }>`
  background-image: url(${(props) => props.img});
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -100;
`;

// project thumbnail with fixed aspect ratio
const ProjectThumbnail = styled.div<{
  img: string;
  width: number;
  height: number;
}>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-image: url(${(props) => props.img});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 5px;
  margin-right: 10px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
`;

const ProjectTitle = styled.h1`
  font-size: 1.5em;
  font-weight: bold;
  margin: 0;
  color: white;
`;

const Text = styled.p`
  margin: 0;
`;

const FakeLink = styled.span`
  color: #3794d1;
  cursor: pointer;

  &:hover {
    color: #50b0f0;
  }
`;

const OpenButton = styled.img`
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;

// Bootstrap like blue button
const Button = styled.button`
  background-color: #0e639c;
  color: white;
  border: 1px solid var(--vscode-button-border, transparent);
  padding: 0.25rem 0;
  margin-top: 0.5rem;
  margin-left: auto;
  margin-right: auto;
  font-size: 13px;
  cursor: pointer;
  width: 15rem;

  &:hover {
    background-color: #1177bb;
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: stretch;
  align-content: stretch;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin-top: 1rem;
`;

export const Project = () => {
  const [project, setProject] = React.useState<UnrealEngineProject>();

  VSCodeWrapper.onMessage((message) => {
    setProject(message.data.project);
  });

  const onOpenProject = () => {
    VSCodeWrapper.postMessage({
      type: "runCommand",
      command: "uetools.openProjectEditor",
    });
  };

  const onChangeEngineVersion = () => {
    VSCodeWrapper.postMessage({
      type: "runCommand",
      command: "uetools.changeEngineVersionRoutine",
    });
  };

  const onGenerateProjectFiles = () => {
    VSCodeWrapper.postMessage({
      type: "runCommand",
      command: "uetools.generateProjectFilesAndCompileCommands",
    });
  };

  const onRebuildEngineCppIndex = () => {
    VSCodeWrapper.postMessage({
      type: "runCommand",
      command: "uetools.rebuildEngineCppIndex",
    });
  };

  const onBuildProject = () => {
    VSCodeWrapper.postMessage({
      type: "runCommand",
      command: "uetools.buildAndGenerateCompileCommands",
    });
  };

  return (
    <>
      <DescriptionPanel>
        <BackgroundImage
          img={
            VSCodeWrapper.extensionUri + encodeURI(`/res/images/uesplash.jpg`)
          }
        />
        {project && (
          <>
            <ProjectThumbnail
              img={
                VSCodeWrapper.workspaceUri + encodeURI(`/${project.Name}.png`)
              }
              width={100}
              height={100}
            />
            <ProjectDetailsPanel>
              <OpenButton
                src={
                  VSCodeWrapper.extensionUri +
                  encodeURI(`/res/icons/arrow-up-right-from-square-solid.png`)
                }
                width={14}
                height={14}
                title="Open in Unreal Editor (Development, without debugging)"
                onClick={onOpenProject}
              />
              <ProjectTitle>{project.Name}</ProjectTitle>
              <Text>
                UE v{project.EngineAssociation}{" "}
                <FakeLink onClick={onChangeEngineVersion}>(change)</FakeLink>
              </Text>
              <Text>
                <FakeLink onClick={onRebuildEngineCppIndex}>
                  Rebuild Engine C++ Index
                </FakeLink>
              </Text>
            </ProjectDetailsPanel>
          </>
        )}
        {typeof project === "undefined" && (
          <>
            <ProjectDetailsPanel>
              <ProjectTitle>No Project Found</ProjectTitle>
              <Text>
                A .uproject file was not found in any of the workspace folders.
              </Text>
            </ProjectDetailsPanel>
          </>
        )}
      </DescriptionPanel>
      {project && (
        <ButtonsWrapper>
          <Button onClick={onGenerateProjectFiles}>
            Generate Project Files
          </Button>
          <Button onClick={onBuildProject}>Build</Button>
        </ButtonsWrapper>
      )}
    </>
  );
};

ReactDOM.render(<Project />, document.getElementById("root"));

VSCodeWrapper.postMessage({
  type: "onReady",
  data: "Hello from the extension!",
});
