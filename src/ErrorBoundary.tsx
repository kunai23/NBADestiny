import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  handleReset = () => {
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="screen">
          <div className="card summary-card">
            <span className="badge badge-crucial">Erreur</span>
            <h2>Un problème est survenu</h2>
            <p className="story-body">
              Ta sauvegarde semble incompatible avec cette version du jeu. Réinitialise pour repartir sur une
              nouvelle carrière.
            </p>
            <button className="btn btn-primary" onClick={this.handleReset}>
              Réinitialiser et recommencer
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
